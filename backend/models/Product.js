const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required']
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        default: 'Shree Shyam Collection',
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    costPrice: {
        type: Number,
        min: [0, 'Cost price cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR']
    },
    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
        default: 0
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    colors: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
        },
        images: [{
            public_id: String,
            url: String,
            alt: String
        }],
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    sizes: [{
        name: {
            type: String,
            required: true,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
            trim: true
        },
        measurements: {
            bust: Number,
            waist: Number,
            hips: Number,
            length: Number,
            sleeves: Number
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative']
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    material: {
        fabric: {
            type: String,
            required: true,
            trim: true
        },
        care: [{
            type: String,
            trim: true
        }],
        composition: [{
            material: String,
            percentage: Number
        }]
    },
    features: [{
        type: String,
        trim: true
    }],
    occasion: [{
        type: String,
        enum: ['casual', 'formal', 'party', 'wedding', 'festival', 'office', 'ethnic', 'traditional'],
        trim: true
    }],
    style: {
        type: String,
        trim: true
    },
    work: {
        type: String,
        trim: true
    },
    neckline: {
        type: String,
        trim: true
    },
    sleeves: {
        type: String,
        trim: true
    },
    pattern: {
        type: String,
        trim: true
    },
    embellishments: [{
        type: String,
        trim: true
    }],
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    totalStock: {
        type: Number,
        default: 0,
        min: [0, 'Total stock cannot be negative']
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: [0, 'Low stock threshold cannot be negative']
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    metaKeywords: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    purchaseCount: {
        type: Number,
        default: 0
    },
    wishlistCount: {
        type: Number,
        default: 0
    },
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    crossSellProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    upsellProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    hsn: {
        type: String,
        default: '6204'
    },
    gst: {
        type: Number,
        default: 18,
        min: [0, 'GST cannot be negative'],
        max: [100, 'GST cannot exceed 100%']
    },
    returnPolicy: {
        type: String,
        default: '30 days return policy'
    },
    warranty: {
        type: String
    },
    shippingInfo: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        shippingClass: {
            type: String,
            enum: ['standard', 'express', 'overnight'],
            default: 'standard'
        }
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedAt: {
        type: Date
    },
    archivedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    if (this.originalPrice && this.discount > 0) {
        return Math.round(this.originalPrice * (1 - this.discount / 100));
    }
    return this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.price < this.originalPrice) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return this.discount || 0;
});

// Virtual for availability status
productSchema.virtual('isInStock').get(function() {
    return this.totalStock > 0;
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
    return this.totalStock <= this.lowStockThreshold && this.totalStock > 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
    const primaryImg = this.images.find(img => img.isPrimary);
    return primaryImg || this.images[0] || null;
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: -1 });
productSchema.index({ isNewArrival: -1 });
productSchema.index({ isBestSeller: -1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ isActive: 1 });
productSchema.index({ 'colors.name': 1 });
productSchema.index({ 'sizes.name': 1 });

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

// Pre-save middleware to calculate total stock
productSchema.pre('save', function(next) {
    if (this.isModified('sizes')) {
        this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
    }
    next();
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
    if (this.isModified('images')) {
        const primaryImages = this.images.filter(img => img.isPrimary);
        if (primaryImages.length > 1) {
            // Keep only the first primary image
            this.images.forEach((img, index) => {
                if (index > 0 && img.isPrimary) {
                    img.isPrimary = false;
                }
            });
        } else if (primaryImages.length === 0 && this.images.length > 0) {
            // Set first image as primary if none is set
            this.images[0].isPrimary = true;
        }
    }
    next();
});

// Instance method to update stock
productSchema.methods.updateStock = function(sizeId, quantity) {
    const size = this.sizes.id(sizeId);
    if (size) {
        size.stock = Math.max(0, size.stock + quantity);
        this.totalStock = this.sizes.reduce((total, s) => total + s.stock, 0);
        return this.save();
    }
    throw new Error('Size not found');
};

// Instance method to check if product is available in specific size and color
productSchema.methods.isAvailable = function(sizeName, colorName) {
    const size = this.sizes.find(s => s.name === sizeName && s.isAvailable);
    const color = this.colors.find(c => c.name === colorName && c.isAvailable);
    return !!(size && color && size.stock > 0);
};

// Instance method to increment view count
productSchema.methods.incrementViewCount = function() {
    this.viewCount += 1;
    return this.save();
};

// Instance method to add review
productSchema.methods.addReview = function(reviewId) {
    this.reviews.push(reviewId);
    return this.save();
};

// Instance method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
    return this.populate('reviews')
        .then(product => {
            if (product.reviews.length === 0) {
                product.averageRating = 0;
                product.numReviews = 0;
            } else {
                const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
                product.averageRating = Math.round((totalRating / product.reviews.length) * 10) / 10;
                product.numReviews = product.reviews.length;
            }
            return product.save();
        });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId, options = {}) {
    const query = { category: categoryId, isActive: true };
    return this.find(query, null, options).populate('category');
};

// Static method to search products
productSchema.statics.search = function(searchTerm, options = {}) {
    const query = {
        $text: { $search: searchTerm },
        isActive: true
    };
    return this.find(query, { score: { $meta: 'textScore' } }, options)
        .sort({ score: { $meta: 'textScore' } });
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 8) {
    return this.find({ isFeatured: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('category');
};

// Static method to get new arrivals
productSchema.statics.getNewArrivals = function(limit = 8) {
    return this.find({ isNewArrival: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('category');
};

// Static method to get best sellers
productSchema.statics.getBestSellers = function(limit = 8) {
    return this.find({ isBestSeller: true, isActive: true })
        .sort({ purchaseCount: -1 })
        .limit(limit)
        .populate('category');
};

// Static method to get product statistics
productSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                activeProducts: {
                    $sum: {
                        $cond: [{ $eq: ['$isActive', true] }, 1, 0]
                    }
                },
                totalStock: { $sum: '$totalStock' },
                averagePrice: { $avg: '$price' },
                featuredProducts: {
                    $sum: {
                        $cond: [{ $eq: ['$isFeatured', true] }, 1, 0]
                    }
                }
            }
        }
    ]);
};

module.exports = mongoose.model('Product', productSchema);