const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            priceMin,
            priceMax,
            color,
            size,
            fabric,
            occasion,
            search,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build filter query
        const filter = { status: 'active' };

        if (category) {
            filter.category = category;
        }

        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = Number(priceMin);
            if (priceMax) filter.price.$lte = Number(priceMax);
        }

        if (color) {
            filter['variants.color'] = { $in: Array.isArray(color) ? color : [color] };
        }

        if (size) {
            filter['variants.sizes.size'] = { $in: Array.isArray(size) ? size : [size] };
        }

        if (fabric) {
            filter.fabric = fabric;
        }

        if (occasion) {
            filter.occasions = { $in: Array.isArray(occasion) ? occasion : [occasion] };
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort query
        const sortQuery = {};
        sortQuery[sort] = order === 'desc' ? -1 : 1;

        // Execute query with pagination
        const products = await Product.find(filter)
            .sort(sortQuery)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('reviews')
            .exec();

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// Get featured products
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({
            status: 'active',
            isFeatured: true
        })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('reviews');

        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
            error: error.message
        });
    }
});

// Get new arrivals
router.get('/new-arrivals', async (req, res) => {
    try {
        const products = await Product.find({
            status: 'active',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
        .sort({ createdAt: -1 })
        .limit(12)
        .populate('reviews');

        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch new arrivals',
            error: error.message
        });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('reviews.user', 'firstName lastName avatar')
            .populate('relatedProducts');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
});

// Add product review
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const { rating, comment, title } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed this product
        const existingReview = product.reviews.find(
            review => review.user.toString() === req.userId
        );

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Add review
        product.reviews.push({
            user: req.userId,
            rating,
            comment,
            title,
            date: new Date()
        });

        await product.save();

        // Populate the new review
        const updatedProduct = await Product.findById(req.params.id)
            .populate('reviews.user', 'firstName lastName avatar');

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: { 
                product: updatedProduct,
                review: updatedProduct.reviews[updatedProduct.reviews.length - 1]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add review',
            error: error.message
        });
    }
});

// Get product categories
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        
        res.json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
});

// Get available filters
router.get('/filters/options', async (req, res) => {
    try {
        const [categories, colors, sizes, fabrics, occasions] = await Promise.all([
            Product.distinct('category'),
            Product.distinct('variants.color'),
            Product.distinct('variants.sizes.size'),
            Product.distinct('fabric'),
            Product.distinct('occasions')
        ]);

        const priceRange = await Product.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                categories: categories.filter(Boolean),
                colors: colors.filter(Boolean),
                sizes: sizes.filter(Boolean),
                fabrics: fabrics.filter(Boolean),
                occasions: occasions.flat().filter(Boolean),
                priceRange: priceRange[0] || { minPrice: 0, maxPrice: 50000 }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch filter options',
            error: error.message
        });
    }
});

// Search suggestions
router.get('/search/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: { suggestions: [] }
            });
        }

        const suggestions = await Product.find({
            status: 'active',
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        })
        .select('name category')
        .limit(5);

        res.json({
            success: true,
            data: { suggestions }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch search suggestions',
            error: error.message
        });
    }
});

// Admin routes (protected)

// Create product
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const product = new Product({
            ...req.body,
            createdBy: req.userId
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

module.exports = router;