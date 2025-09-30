const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow null for guest orders
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: false // Allow null for guest orders with direct product data
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        originalPrice: {
            type: Number,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        sku: {
            type: String,
            required: true
        },
        hsn: {
            type: String,
            default: '6204'
        },
        gst: {
            type: Number,
            default: 18
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    shippingAddress: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true
        },
        addressLine2: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
        },
        country: {
            type: String,
            required: true,
            default: 'India'
        },
        phone: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
        }
    },
    billingAddress: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true
        },
        addressLine2: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
        },
        country: {
            type: String,
            required: true,
            default: 'India'
        },
        phone: {
            type: String,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
        }
    },
    pricing: {
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        tax: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        shipping: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        discount: {
            type: Number,
            min: 0,
            default: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    payment: {
        method: {
            type: String,
            required: true,
            enum: ['cod', 'online', 'upi', 'card', 'netbanking', 'wallet']
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
            default: 'pending'
        },
        transactionId: {
            type: String
        },
        paymentGateway: {
            type: String,
            enum: ['razorpay', 'stripe', 'paytm', 'paypal']
        },
        paidAt: {
            type: Date
        },
        failureReason: {
            type: String
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
        default: 'pending'
    },
    shipping: {
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight'],
            default: 'standard'
        },
        carrier: {
            type: String
        },
        trackingNumber: {
            type: String
        },
        estimatedDelivery: {
            type: Date
        },
        shippedAt: {
            type: Date
        },
        deliveredAt: {
            type: Date
        }
    },
    timeline: [{
        status: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    notes: {
        customer: {
            type: String,
            maxlength: 500
        },
        internal: {
            type: String,
            maxlength: 1000
        }
    },
    coupon: {
        code: {
            type: String,
            uppercase: true
        },
        discount: {
            type: Number,
            min: 0
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed']
        }
    },
    gift: {
        isGift: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            maxlength: 500
        },
        recipientName: {
            type: String,
            trim: true
        },
        recipientEmail: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    customerService: {
        supportTickets: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SupportTicket'
        }],
        complaints: [{
            type: String,
            maxlength: 1000
        }]
    },
    cancellation: {
        isCancelled: {
            type: Boolean,
            default: false
        },
        reason: {
            type: String,
            maxlength: 500
        },
        cancelledAt: {
            type: Date
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        refundAmount: {
            type: Number,
            min: 0
        },
        refundStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed']
        }
    },
    return: {
        isReturned: {
            type: Boolean,
            default: false
        },
        reason: {
            type: String,
            maxlength: 500
        },
        returnedAt: {
            type: Date
        },
        returnedItems: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                min: 1
            },
            condition: {
                type: String,
                enum: ['new', 'good', 'damaged']
            }
        }],
        refundAmount: {
            type: Number,
            min: 0
        },
        refundStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed']
        }
    },
    loyaltyPoints: {
        earned: {
            type: Number,
            default: 0,
            min: 0
        },
        used: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    invoice: {
        number: {
            type: String,
            unique: true,
            sparse: true
        },
        url: {
            type: String
        },
        generatedAt: {
            type: Date
        }
    },
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    source: {
        type: String,
        enum: ['website', 'mobile_app', 'phone', 'store'],
        default: 'website'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    // Guest order fields
    customerEmail: {
        type: String,
        required: false
    },
    customerPhone: {
        type: String,
        required: false
    },
    orderType: {
        type: String,
        enum: ['registered', 'guest'],
        default: 'registered'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full shipping address
orderSchema.virtual('shippingAddressString').get(function() {
    const addr = this.shippingAddress;
    return `${addr.firstName} ${addr.lastName}, ${addr.addressLine1}, ${addr.addressLine2 ? addr.addressLine2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country}`;
});

// Virtual for order total including all charges
orderSchema.virtual('finalTotal').get(function() {
    return this.pricing.subtotal + this.pricing.tax + this.pricing.shipping - this.pricing.discount;
});

// Virtual for delivery status
orderSchema.virtual('isDelivered').get(function() {
    return this.status === 'delivered';
});

// Virtual for pending status
orderSchema.virtual('isPending').get(function() {
    return ['pending', 'confirmed', 'processing'].includes(this.status);
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });
orderSchema.index({ 'payment.transactionId': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const count = await this.constructor.countDocuments();
        const orderNumber = `SSC${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(4, '0')}`;
        this.orderNumber = orderNumber;
    }
    next();
});

// Pre-save middleware to add timeline entry
orderSchema.pre('save', function(next) {
    if (this.isModified('status') && !this.isNew) {
        this.timeline.push({
            status: this.status,
            message: `Order status changed to ${this.status}`,
            timestamp: new Date()
        });
    }
    next();
});

// Pre-save middleware to calculate pricing
orderSchema.pre('save', function(next) {
    if (this.isModified('items') || this.isNew) {
        // Calculate subtotal
        this.pricing.subtotal = this.items.reduce((total, item) => total + item.total, 0);
        
        // Calculate tax (18% GST)
        this.pricing.tax = Math.round(this.pricing.subtotal * 0.18);
        
        // Calculate shipping (free above ₹1999)
        this.pricing.shipping = this.pricing.subtotal >= 1999 ? 0 : 99;
        
        // Calculate final total
        this.pricing.total = this.pricing.subtotal + this.pricing.tax + this.pricing.shipping - (this.pricing.discount || 0);
    }
    next();
});

// Instance method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, message, updatedBy) {
    this.timeline.push({
        status,
        message,
        timestamp: new Date(),
        updatedBy
    });
    return this.save();
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, message, updatedBy) {
    this.status = newStatus;
    
    // Set specific timestamps based on status
    switch (newStatus) {
        case 'shipped':
            this.shipping.shippedAt = new Date();
            break;
        case 'delivered':
            this.shipping.deliveredAt = new Date();
            this.actualDeliveryDate = new Date();
            break;
        case 'cancelled':
            this.cancellation.isCancelled = true;
            this.cancellation.cancelledAt = new Date();
            if (updatedBy) this.cancellation.cancelledBy = updatedBy;
            break;
    }
    
    // Add timeline entry
    this.timeline.push({
        status: newStatus,
        message: message || `Order ${newStatus}`,
        timestamp: new Date(),
        updatedBy
    });
    
    return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy) {
    this.status = 'cancelled';
    this.cancellation = {
        isCancelled: true,
        reason,
        cancelledAt: new Date(),
        cancelledBy
    };
    
    this.timeline.push({
        status: 'cancelled',
        message: `Order cancelled. Reason: ${reason}`,
        timestamp: new Date(),
        updatedBy: cancelledBy
    });
    
    return this.save();
};

// Instance method to process refund
orderSchema.methods.processRefund = function(amount, reason) {
    this.cancellation.refundAmount = amount;
    this.cancellation.refundStatus = 'processing';
    
    this.timeline.push({
        status: 'refund_processing',
        message: `Refund of ₹${amount} is being processed. Reason: ${reason}`,
        timestamp: new Date()
    });
    
    return this.save();
};

// Static method to get orders by user
orderSchema.statics.getByUser = function(userId, options = {}) {
    return this.find({ user: userId }, null, options)
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getStats = function(startDate, endDate) {
    const match = {};
    if (startDate && endDate) {
        match.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$pricing.total' },
                averageOrderValue: { $avg: '$pricing.total' },
                pendingOrders: {
                    $sum: {
                        $cond: [{ $in: ['$status', ['pending', 'confirmed', 'processing']] }, 1, 0]
                    }
                },
                deliveredOrders: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
                    }
                },
                cancelledOrders: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
                    }
                }
            }
        }
    ]);
};

// Static method to get recent orders
orderSchema.statics.getRecent = function(limit = 10) {
    return this.find({})
        .populate('user', 'firstName lastName email')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to search orders
orderSchema.statics.search = function(searchTerm) {
    return this.find({
        $or: [
            { orderNumber: new RegExp(searchTerm, 'i') },
            { 'shippingAddress.firstName': new RegExp(searchTerm, 'i') },
            { 'shippingAddress.lastName': new RegExp(searchTerm, 'i') },
            { 'shipping.trackingNumber': new RegExp(searchTerm, 'i') }
        ]
    })
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema);