const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            couponCode,
            specialInstructions
        } = req.body;

        // Validate and calculate order details
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product with ID ${item.product} not found`
                });
            }

            // Check if variant exists and has enough stock
            const variant = product.variants.find(v => v.color === item.color);
            if (!variant) {
                return res.status(400).json({
                    success: false,
                    message: `Color variant ${item.color} not found for ${product.name}`
                });
            }

            const sizeOption = variant.sizes.find(s => s.size === item.size);
            if (!sizeOption || sizeOption.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name} - ${item.color} - ${item.size}`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                image: variant.images[0] || product.images[0],
                total: itemTotal
            });
        }

        // Calculate tax and shipping
        const tax = subtotal * 0.18; // 18% GST
        const shipping = subtotal > 2000 ? 0 : 100; // Free shipping above ₹2000
        const total = subtotal + tax + shipping;

        // Create order
        const order = new Order({
            user: req.userId,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            total,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            couponCode,
            specialInstructions,
            timeline: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order placed successfully'
            }]
        });

        await order.save();

        // Update product stock
        for (const item of items) {
            await Product.updateOne(
                {
                    _id: item.product,
                    'variants.color': item.color,
                    'variants.sizes.size': item.size
                },
                {
                    $inc: {
                        'variants.$.sizes.$[size].stock': -item.quantity,
                        totalStock: -item.quantity
                    }
                },
                {
                    arrayFilters: [{ 'size.size': item.size }]
                }
            );
        }

        // Update user's total spent and loyalty points
        const user = await User.findById(req.userId);
        user.totalSpent += total;
        user.loyaltyPoints += Math.floor(total / 100); // 1 point per ₹100
        await user.save();

        // Clear user's cart
        user.cart = [];
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const filter = { user: req.userId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('items.product', 'name images')
            .exec();

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / limit),
                    totalOrders: total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name images category');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        const user = await User.findById(req.userId);
        if (order.user._id.toString() !== req.userId && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Update order status
        order.status = 'cancelled';
        order.timeline.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: req.body.reason || 'Cancelled by customer'
        });

        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.updateOne(
                {
                    _id: item.product,
                    'variants.color': item.color,
                    'variants.sizes.size': item.size
                },
                {
                    $inc: {
                        'variants.$.sizes.$[size].stock': item.quantity,
                        totalStock: item.quantity
                    }
                },
                {
                    arrayFilters: [{ 'size.size': item.size }]
                }
            );
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
});

// Admin routes

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const {
            page = 1,
            limit = 20,
            status,
            startDate,
            endDate,
            search
        } = req.query;

        // Build filter
        const filter = {};
        
        if (status) {
            filter.status = status;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'firstName lastName email')
            .populate('items.product', 'name')
            .exec();

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / limit),
                    totalOrders: total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { status, note, trackingNumber } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        order.status = status;
        order.timeline.push({
            status,
            timestamp: new Date(),
            note: note || `Order ${status}`,
            updatedBy: req.userId
        });

        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

// Get order statistics (admin only)
router.get('/admin/statistics', auth, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const [
            totalOrders,
            todayOrders,
            monthlyOrders,
            totalRevenue,
            monthlyRevenue,
            pendingOrders,
            statusDistribution
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: startOfDay } }),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.aggregate([
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Order.countDocuments({ status: 'pending' }),
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                orders: {
                    total: totalOrders,
                    today: todayOrders,
                    monthly: monthlyOrders,
                    pending: pendingOrders
                },
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    monthly: monthlyRevenue[0]?.total || 0
                },
                statusDistribution: statusDistribution.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order statistics',
            error: error.message
        });
    }
});

// Guest checkout route (no authentication required)
router.post('/guest', async (req, res) => {
    try {
        const {
            items,
            customer,
            paymentMethod,
            totals
        } = req.body;

        // Validate required fields
        if (!items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Items are required'
            });
        }

        if (!customer || !customer.firstName || !customer.email || !customer.phone) {
            return res.status(400).json({
                success: false,
                message: 'Customer information is required'
            });
        }

        // Generate order number
        const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

        // Create guest order
        const guestOrder = new Order({
            orderNumber,
            // For guest orders, we'll create a temporary user or use null
            user: null,
            items: items.map(item => ({
                product: null, // For now, we'll store product data directly
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                sku: item.sku || 'GUEST-' + Date.now(),
                total: item.price * item.quantity
            })),
            // Use pricing structure that matches schema
            pricing: {
                subtotal: totals.subtotal,
                tax: totals.tax,
                shipping: totals.shipping,
                total: totals.total
            },
            // Use payment structure that matches schema
            payment: {
                method: paymentMethod,
                status: 'pending'
            },
            shippingAddress: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                addressLine1: customer.address,
                city: customer.city,
                state: customer.state,
                pincode: customer.pincode,
                country: customer.country || 'India',
                phone: customer.phone
            },
            billingAddress: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                addressLine1: customer.address,
                city: customer.city,
                state: customer.state,
                pincode: customer.pincode,
                country: customer.country || 'India',
                phone: customer.phone
            },
            customerEmail: customer.email,
            customerPhone: customer.phone,
            orderType: 'guest',
            // Use timeline structure that matches schema
            timeline: [{
                status: 'pending',
                message: 'Guest order placed successfully',
                timestamp: new Date()
            }]
        });

        await guestOrder.save();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                id: guestOrder._id,
                orderNumber: guestOrder.orderNumber,
                total: guestOrder.pricing.total,
                status: 'pending',
                paymentMethod: guestOrder.payment.method
            }
        });

    } catch (error) {
        console.error('Guest order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

module.exports = router;