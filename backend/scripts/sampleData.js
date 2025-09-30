const mongoose = require('mongoose');
require('dotenv').config();

// Sample data for Shree Shyam Collection
const categories = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Sarees',
        slug: 'sarees',
        description: 'Elegant sarees for every occasion',
        image: {
            url: 'images/category-sarees.jpg',
            alt: 'Sarees Collection'
        },
        isActive: true,
        subcategories: ['Silk Sarees', 'Cotton Sarees', 'Georgette Sarees', 'Chiffon Sarees', 'Designer Sarees']
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Lehengas',
        slug: 'lehengas',
        description: 'Royal lehengas for special occasions',
        image: {
            url: 'images/category-lehengas.jpg',
            alt: 'Lehengas Collection'
        },
        isActive: true,
        subcategories: ['Bridal Lehengas', 'Party Lehengas', 'Wedding Lehengas', 'Designer Lehengas']
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Kurtis',
        slug: 'kurtis',
        description: 'Comfortable and stylish kurtis',
        image: {
            url: 'images/category-kurtis.jpg',
            alt: 'Kurtis Collection'
        },
        isActive: true,
        subcategories: ['Cotton Kurtis', 'Silk Kurtis', 'Printed Kurtis', 'Embroidered Kurtis']
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Suits',
        slug: 'suits',
        description: 'Graceful suits for formal occasions',
        image: {
            url: 'images/category-suits.jpg',
            alt: 'Suits Collection'
        },
        isActive: true,
        subcategories: ['Salwar Suits', 'Churidar Suits', 'Palazzo Suits', 'Anarkali Suits']
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Accessories',
        slug: 'accessories',
        description: 'Traditional accessories and jewelry',
        image: {
            url: 'images/category-accessories.jpg',
            alt: 'Accessories Collection'
        },
        isActive: true,
        subcategories: ['Jewelry', 'Bags', 'Scarves', 'Hair Accessories']
    }
];

const sampleProducts = [
    // Sarees
    {
        name: 'Royal Blue Silk Saree with Golden Border',
        slug: 'royal-blue-silk-saree-golden-border',
        description: 'Exquisite royal blue silk saree with intricate golden border work. Perfect for weddings and special occasions. The saree features traditional motifs and comes with a matching blouse piece.',
        shortDescription: 'Royal blue silk saree with golden border work',
        sku: 'SSC-SAR-001',
        category: categories[0]._id, // Sarees
        subcategory: 'Silk Sarees',
        price: 4999,
        originalPrice: 6999,
        discount: 28,
        images: [
            {
                public_id: 'saree_1_main',
                url: 'images/products/saree-royal-blue-1.jpg',
                alt: 'Royal Blue Silk Saree Front View',
                isPrimary: true
            },
            {
                public_id: 'saree_1_back',
                url: 'images/products/saree-royal-blue-2.jpg',
                alt: 'Royal Blue Silk Saree Back View',
                isPrimary: false
            }
        ],
        colors: [
            {
                name: 'Royal Blue',
                code: '#4169E1',
                isAvailable: true
            }
        ],
        sizes: [
            { name: 'Free Size', stock: 25, isAvailable: true }
        ],
        material: {
            fabric: 'Pure Silk',
            care: ['Dry clean only', 'Iron on reverse side', 'Store in cool dry place'],
            composition: [
                { material: 'Silk', percentage: 100 }
            ]
        },
        features: ['Golden border work', 'Traditional motifs', 'Matching blouse piece', 'Premium quality silk'],
        occasion: ['wedding', 'festival', 'formal'],
        style: 'Traditional',
        work: 'Golden border embroidery',
        pattern: 'Traditional motifs',
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        tags: ['silk', 'saree', 'traditional', 'wedding', 'royal blue', 'golden border'],
        metaTitle: 'Royal Blue Silk Saree with Golden Border',
        metaDescription: 'Shop royal blue silk saree with golden border work. Perfect for weddings and festivals. Free shipping above ₹1999.',
        metaKeywords: ['silk saree', 'royal blue saree', 'golden border saree', 'wedding saree'],
        averageRating: 4.5,
        numReviews: 12,
        viewCount: 156,
        returnPolicy: '30 days easy return',
        createdBy: new mongoose.Types.ObjectId()
    },
    {
        name: 'Elegant Red Designer Lehenga with Heavy Embroidery',
        slug: 'elegant-red-designer-lehenga-heavy-embroidery',
        description: 'Stunning red designer lehenga with heavy embroidery work. Features intricate thread work, sequins, and stone embellishments. Comes with matching choli and dupatta.',
        shortDescription: 'Red designer lehenga with heavy embroidery',
        sku: 'SSC-LEH-001',
        category: categories[1]._id, // Lehengas
        subcategory: 'Designer Lehengas',
        price: 15999,
        originalPrice: 21999,
        discount: 27,
        images: [
            {
                public_id: 'lehenga_1_main',
                url: 'images/products/lehenga-red-1.jpg',
                alt: 'Red Designer Lehenga Front View',
                isPrimary: true
            },
            {
                public_id: 'lehenga_1_detail',
                url: 'images/products/lehenga-red-2.jpg',
                alt: 'Red Designer Lehenga Detail View',
                isPrimary: false
            }
        ],
        colors: [
            {
                name: 'Red',
                code: '#DC143C',
                isAvailable: true
            }
        ],
        sizes: [
            { name: 'XS', stock: 5, isAvailable: true },
            { name: 'S', stock: 8, isAvailable: true },
            { name: 'M', stock: 12, isAvailable: true },
            { name: 'L', stock: 10, isAvailable: true },
            { name: 'XL', stock: 6, isAvailable: true }
        ],
        material: {
            fabric: 'Net with Silk Lining',
            care: ['Dry clean only', 'Handle with care', 'Store flat'],
            composition: [
                { material: 'Net', percentage: 60 },
                { material: 'Silk', percentage: 40 }
            ]
        },
        features: ['Heavy embroidery', 'Sequin work', 'Stone embellishments', 'Semi-stitched', 'Can be customized'],
        occasion: ['wedding', 'party', 'festival'],
        style: 'Designer',
        work: 'Heavy embroidery with sequins and stones',
        neckline: 'Sweetheart',
        sleeves: 'Sleeveless',
        pattern: 'Floral embroidery',
        embellishments: ['Sequins', 'Stones', 'Thread work'],
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        tags: ['lehenga', 'designer', 'red', 'embroidery', 'wedding', 'bridal'],
        metaTitle: 'Red Designer Lehenga with Heavy Embroidery',
        metaDescription: 'Buy elegant red designer lehenga with heavy embroidery. Perfect for weddings and special occasions.',
        metaKeywords: ['designer lehenga', 'red lehenga', 'wedding lehenga', 'embroidered lehenga'],
        averageRating: 4.8,
        numReviews: 24,
        viewCount: 298,
        createdBy: new mongoose.Types.ObjectId()
    },
    {
        name: 'Cotton Printed Kurti with Palazzo Set',
        slug: 'cotton-printed-kurti-palazzo-set',
        description: 'Comfortable cotton printed kurti with matching palazzo set. Features beautiful floral prints and 3/4 sleeves. Perfect for daily wear and casual occasions.',
        shortDescription: 'Cotton printed kurti with palazzo set',
        sku: 'SSC-KUR-001',
        category: categories[2]._id, // Kurtis
        subcategory: 'Cotton Kurtis',
        price: 1299,
        originalPrice: 1799,
        discount: 28,
        images: [
            {
                public_id: 'kurti_1_main',
                url: 'images/products/kurti-cotton-1.jpg',
                alt: 'Cotton Printed Kurti Front View',
                isPrimary: true
            },
            {
                public_id: 'kurti_1_palazzo',
                url: 'images/products/kurti-cotton-2.jpg',
                alt: 'Cotton Kurti with Palazzo',
                isPrimary: false
            }
        ],
        colors: [
            {
                name: 'Pink',
                code: '#FF69B4',
                isAvailable: true
            },
            {
                name: 'Blue',
                code: '#4169E1',
                isAvailable: true
            }
        ],
        sizes: [
            { name: 'S', stock: 15, isAvailable: true },
            { name: 'M', stock: 20, isAvailable: true },
            { name: 'L', stock: 18, isAvailable: true },
            { name: 'XL', stock: 12, isAvailable: true },
            { name: 'XXL', stock: 8, isAvailable: true }
        ],
        material: {
            fabric: '100% Cotton',
            care: ['Machine wash cold', 'Iron on medium heat', 'Do not bleach'],
            composition: [
                { material: 'Cotton', percentage: 100 }
            ]
        },
        features: ['Floral print', 'Comfortable fit', '3/4 sleeves', 'Matching palazzo', 'Breathable fabric'],
        occasion: ['casual', 'office'],
        style: 'Contemporary',
        work: 'Printed',
        neckline: 'Round neck',
        sleeves: '3/4 sleeves',
        pattern: 'Floral print',
        isActive: true,
        isNewArrival: true,
        tags: ['kurti', 'cotton', 'printed', 'palazzo', 'casual', 'comfortable'],
        metaTitle: 'Cotton Printed Kurti with Palazzo Set',
        metaDescription: 'Shop comfortable cotton printed kurti with palazzo set. Perfect for daily wear and office.',
        metaKeywords: ['cotton kurti', 'printed kurti', 'palazzo set', 'casual wear'],
        averageRating: 4.3,
        numReviews: 18,
        viewCount: 145,
        createdBy: new mongoose.Types.ObjectId()
    },
    {
        name: 'Anarkali Suit with Dupatta - Purple',
        slug: 'anarkali-suit-dupatta-purple',
        description: 'Beautiful purple Anarkali suit with matching dupatta. Features elegant embroidery work on the yoke and sleeves. Perfect for festivals and special occasions.',
        shortDescription: 'Purple Anarkali suit with dupatta',
        sku: 'SSC-SUI-001',
        category: categories[3]._id, // Suits
        subcategory: 'Anarkali Suits',
        price: 3499,
        originalPrice: 4999,
        discount: 30,
        images: [
            {
                public_id: 'anarkali_1_main',
                url: 'images/products/anarkali-purple-1.jpg',
                alt: 'Purple Anarkali Suit Front View',
                isPrimary: true
            }
        ],
        colors: [
            {
                name: 'Purple',
                code: '#8A2BE2',
                isAvailable: true
            }
        ],
        sizes: [
            { name: 'S', stock: 10, isAvailable: true },
            { name: 'M', stock: 15, isAvailable: true },
            { name: 'L', stock: 12, isAvailable: true },
            { name: 'XL', stock: 8, isAvailable: true }
        ],
        material: {
            fabric: 'Georgette',
            care: ['Dry clean recommended', 'Iron on low heat', 'Handle with care'],
            composition: [
                { material: 'Georgette', percentage: 100 }
            ]
        },
        features: ['Embroidery work', 'Flowy silhouette', 'Full sleeves', 'Matching dupatta'],
        occasion: ['festival', 'party', 'formal'],
        style: 'Traditional',
        work: 'Embroidery',
        neckline: 'Round neck',
        sleeves: 'Full sleeves',
        pattern: 'Embroidered',
        isActive: true,
        tags: ['anarkali', 'suit', 'purple', 'embroidery', 'festival'],
        metaTitle: 'Purple Anarkali Suit with Dupatta',
        metaDescription: 'Shop beautiful purple Anarkali suit with dupatta. Perfect for festivals and parties.',
        metaKeywords: ['anarkali suit', 'purple suit', 'embroidered suit', 'festival wear'],
        averageRating: 4.4,
        numReviews: 15,
        viewCount: 89,
        createdBy: new mongoose.Types.ObjectId()
    },
    {
        name: 'Traditional Gold Plated Jewelry Set',
        slug: 'traditional-gold-plated-jewelry-set',
        description: 'Elegant traditional gold plated jewelry set with necklace, earrings, and maang tikka. Features intricate designs with artificial pearls and stones.',
        shortDescription: 'Gold plated jewelry set with necklace and earrings',
        sku: 'SSC-ACC-001',
        category: categories[4]._id, // Accessories
        subcategory: 'Jewelry',
        price: 899,
        originalPrice: 1299,
        discount: 31,
        images: [
            {
                public_id: 'jewelry_1_main',
                url: 'images/products/jewelry-gold-1.jpg',
                alt: 'Gold Plated Jewelry Set',
                isPrimary: true
            }
        ],
        colors: [
            {
                name: 'Gold',
                code: '#FFD700',
                isAvailable: true
            }
        ],
        sizes: [
            { name: 'Free Size', stock: 30, isAvailable: true }
        ],
        material: {
            fabric: 'Gold Plated Metal',
            care: ['Keep away from water', 'Store in jewelry box', 'Clean with soft cloth'],
            composition: [
                { material: 'Metal', percentage: 80 },
                { material: 'Artificial Stones', percentage: 20 }
            ]
        },
        features: ['Gold plated', 'Artificial pearls', 'Stone work', 'Complete set'],
        occasion: ['wedding', 'festival', 'party'],
        style: 'Traditional',
        pattern: 'Traditional motifs',
        isActive: true,
        tags: ['jewelry', 'gold plated', 'traditional', 'necklace', 'earrings'],
        metaTitle: 'Traditional Gold Plated Jewelry Set',
        metaDescription: 'Shop traditional gold plated jewelry set with necklace and earrings. Perfect for weddings and festivals.',
        metaKeywords: ['gold plated jewelry', 'traditional jewelry', 'necklace set', 'ethnic jewelry'],
        averageRating: 4.2,
        numReviews: 21,
        viewCount: 176,
        createdBy: new mongoose.Types.ObjectId()
    }
];

const sampleUsers = [
    {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@shreeshyamcollection.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true,
        preferences: {
            newsletter: true,
            smsUpdates: true,
            personalizedRecommendations: true
        }
    },
    {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@example.com',
        password: 'user123',
        phone: '9876543210',
        role: 'user',
        isEmailVerified: true,
        addresses: [{
            type: 'home',
            firstName: 'Priya',
            lastName: 'Sharma',
            addressLine1: '123 Fashion Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            phone: '9876543210',
            isDefault: true
        }]
    }
];

module.exports = {
    categories,
    sampleProducts,
    sampleUsers
};