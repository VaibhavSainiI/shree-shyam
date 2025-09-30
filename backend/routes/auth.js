const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('addresses');
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar,
                    preferences: user.preferences,
                    billingPreferences: user.billingPreferences,
                    addresses: user.addresses,
                    loyaltyPoints: user.loyaltyPoints,
                    totalSpent: user.totalSpent,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile',
            error: error.message
        });
    }
});

// Get billing information for checkout auto-population
router.get('/billing-info', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('addresses');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get default address or first address
        let defaultAddress = user.addresses.find(addr => addr.isDefault);
        if (!defaultAddress && user.addresses.length > 0) {
            defaultAddress = user.addresses[0];
        }

        // Prepare billing information
        const billingInfo = {
            personal: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            },
            address: defaultAddress ? {
                addressLine1: defaultAddress.addressLine1,
                addressLine2: defaultAddress.addressLine2,
                city: defaultAddress.city,
                state: defaultAddress.state,
                pincode: defaultAddress.pincode,
                country: defaultAddress.country,
                phone: defaultAddress.phone || user.phone
            } : null,
            preferences: {
                autoFillFromProfile: user.billingPreferences?.autoFillFromProfile ?? true,
                preferredPaymentMethod: user.billingPreferences?.preferredPaymentMethod || 'cod'
            },
            savedAddresses: user.addresses.map(addr => ({
                id: addr._id,
                type: addr.type,
                firstName: addr.firstName,
                lastName: addr.lastName,
                addressLine1: addr.addressLine1,
                addressLine2: addr.addressLine2,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
                country: addr.country,
                phone: addr.phone,
                isDefault: addr.isDefault
            }))
        };

        res.json({
            success: true,
            message: 'Billing information retrieved successfully',
            data: billingInfo
        });

    } catch (error) {
        console.error('Get billing info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get billing information',
            error: error.message
        });
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, lastName, phone, preferences } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { firstName, lastName, phone, preferences },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Update billing preferences
router.put('/billing-preferences', auth, async (req, res) => {
    try {
        const { autoFillFromProfile, defaultBillingAddress, preferredPaymentMethod, saveCardDetails } = req.body;
        
        const updateData = {};
        if (autoFillFromProfile !== undefined) updateData['billingPreferences.autoFillFromProfile'] = autoFillFromProfile;
        if (defaultBillingAddress !== undefined) updateData['billingPreferences.defaultBillingAddress'] = defaultBillingAddress;
        if (preferredPaymentMethod !== undefined) updateData['billingPreferences.preferredPaymentMethod'] = preferredPaymentMethod;
        if (saveCardDetails !== undefined) updateData['billingPreferences.saveCardDetails'] = saveCardDetails;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Billing preferences updated successfully',
            data: { 
                billingPreferences: user.billingPreferences 
            }
        });
    } catch (error) {
        console.error('Update billing preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update billing preferences',
            error: error.message
        });
    }
});

// Change password
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.userId).select('+password');
        
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
});

// Add address
router.post('/addresses', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.addresses.push(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: { addresses: user.addresses }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add address',
            error: error.message
        });
    }
});

// Update address
router.put('/addresses/:addressId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const address = user.addresses.id(req.params.addressId);
        
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        Object.assign(address, req.body);
        await user.save();

        res.json({
            success: true,
            message: 'Address updated successfully',
            data: { addresses: user.addresses }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update address',
            error: error.message
        });
    }
});

// Delete address
router.delete('/addresses/:addressId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.addresses.id(req.params.addressId).remove();
        await user.save();

        res.json({
            success: true,
            message: 'Address deleted successfully',
            data: { addresses: user.addresses }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete address',
            error: error.message
        });
    }
});

// Get wishlist
router.get('/wishlist', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('wishlist');
        
        res.json({
            success: true,
            data: { wishlist: user.wishlist }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get wishlist',
            error: error.message
        });
    }
});

// Add to wishlist
router.post('/wishlist/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user.wishlist.includes(req.params.productId)) {
            user.wishlist.push(req.params.productId);
            await user.save();
        }

        res.json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add to wishlist',
            error: error.message
        });
    }
});

// Remove from wishlist
router.delete('/wishlist/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.wishlist.pull(req.params.productId);
        await user.save();

        res.json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove from wishlist',
            error: error.message
        });
    }
});

// Google OAuth Demo (for development)
router.post('/google-demo', async (req, res) => {
    try {
        const { firstName, lastName, email, avatar } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user from demo Google data
            user = new User({
                firstName: firstName || 'Demo',
                lastName: lastName || 'User',
                email: email,
                password: 'google_demo_' + Date.now(), // Temporary password for demo users
                avatar: avatar,
                isEmailVerified: true,
                authProvider: 'google'
            });

            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Demo Google authentication successful',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Google demo OAuth error:', error);
        res.status(500).json({
            success: false,
            message: 'Demo Google authentication failed',
            error: error.message
        });
    }
});

// Google OAuth
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required'
            });
        }

        // Verify Google ID Token
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client('936126124062-qr9h1jbj18h2j9s2khf0uue0hd96cqpe.apps.googleusercontent.com'); // Replace with your client ID
        
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: '936126124062-qr9h1jbj18h2j9s2khf0uue0hd96cqpe.apps.googleusercontent.com', // Replace with your client ID
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user from Google data
            user = new User({
                firstName: given_name,
                lastName: family_name,
                email: email,
                password: 'google_oauth_' + Date.now(), // Temporary password for OAuth users
                avatar: {
                    url: picture
                },
                isEmailVerified: true, // Google emails are pre-verified
                authProvider: 'google'
            });

            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Google authentication successful',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message
        });
    }
});

// Facebook Demo authentication (for development)
router.post('/facebook-demo', async (req, res) => {
    try {
        const { firstName, lastName, email, avatar } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = new User({
                firstName,
                lastName,
                email,
                authProvider: 'facebook',
                avatar: avatar ? {
                    url: avatar.url
                } : null,
                isEmailVerified: true
            });

            await user.save();
        } else {
            // Update existing user
            user.authProvider = 'facebook';
            if (avatar) {
                user.avatar = { url: avatar.url };
            }
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Facebook demo authentication successful',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                    authProvider: user.authProvider
                }
            }
        });

    } catch (error) {
        console.error('Facebook demo auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Facebook demo authentication failed'
        });
    }
});

// Facebook OAuth
router.post('/facebook', async (req, res) => {
    try {
        const { accessToken, userID, userData } = req.body;

        if (!accessToken || !userID || !userData) {
            return res.status(400).json({
                success: false,
                message: 'Facebook authentication data is required'
            });
        }

        // Verify Facebook access token (you would implement this with Facebook Graph API)
        // For now, we'll trust the frontend verification
        const { email, name, picture } = userData;
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user from Facebook data
            user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: 'facebook_oauth_' + Date.now(), // Temporary password for OAuth users
                avatar: {
                    url: picture?.data?.url
                },
                isEmailVerified: true, // Facebook emails are pre-verified
                authProvider: 'facebook'
            });

            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Facebook authentication successful',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Facebook OAuth error:', error);
        res.status(500).json({
            success: false,
            message: 'Facebook authentication failed',
            error: error.message
        });
    }
});

module.exports = router;