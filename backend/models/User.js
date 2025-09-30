const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in query results by default
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    avatar: {
        public_id: String,
        url: String
    },
    addresses: [{
        type: {
            type: String,
            enum: ['home', 'office', 'other'],
            default: 'home'
        },
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
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        smsUpdates: {
            type: Boolean,
            default: true
        },
        personalizedRecommendations: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: 'en'
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    billingPreferences: {
        autoFillFromProfile: {
            type: Boolean,
            default: true
        },
        defaultBillingAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'addresses'
        },
        preferredPaymentMethod: {
            type: String,
            enum: ['cod', 'upi', 'card', 'netbanking'],
            default: 'cod'
        },
        saveCardDetails: {
            type: Boolean,
            default: false
        }
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    orderHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deactivatedAt: Date,
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to ensure only one default address
userSchema.pre('save', function(next) {
    if (this.isModified('addresses')) {
        const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
        if (defaultAddresses.length > 1) {
            // Keep only the first default address
            this.addresses.forEach((addr, index) => {
                if (index > 0 && addr.isDefault) {
                    addr.isDefault = false;
                }
            });
        }
    }
    next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: {
                lockUntil: 1
            },
            $set: {
                loginAttempts: 1
            }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        };
    }
    
    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: {
            loginAttempts: 1,
            lockUntil: 1
        }
    });
};

// Instance method to add to cart
userSchema.methods.addToCart = function(productId, quantity, size, color) {
    const existingItemIndex = this.cart.findIndex(item => 
        item.product.toString() === productId.toString() && 
        item.size === size && 
        item.color === color
    );

    if (existingItemIndex >= 0) {
        this.cart[existingItemIndex].quantity += quantity;
    } else {
        this.cart.push({
            product: productId,
            quantity,
            size,
            color
        });
    }

    return this.save();
};

// Instance method to remove from cart
userSchema.methods.removeFromCart = function(productId, size, color) {
    this.cart = this.cart.filter(item => 
        !(item.product.toString() === productId.toString() && 
          item.size === size && 
          item.color === color)
    );
    return this.save();
};

// Instance method to clear cart
userSchema.methods.clearCart = function() {
    this.cart = [];
    return this.save();
};

// Instance method to add loyalty points
userSchema.methods.addLoyaltyPoints = function(points) {
    this.loyaltyPoints += points;
    return this.save();
};

// Static method to find user by email (case insensitive)
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to get user statistics
userSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: {
                        $cond: [{ $eq: ['$isActive', true] }, 1, 0]
                    }
                },
                verifiedUsers: {
                    $sum: {
                        $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0]
                    }
                },
                totalSpent: { $sum: '$totalSpent' },
                averageSpent: { $avg: '$totalSpent' }
            }
        }
    ]);
};

module.exports = mongoose.model('User', userSchema);