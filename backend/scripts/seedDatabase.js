const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

// Import sample data
const { categories, sampleProducts, sampleUsers } = require('./sampleData');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shreeshyamcollection', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for seeding...');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Create Category model (simplified for seeding)
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: {
        url: String,
        alt: String
    },
    subcategories: [String],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Seed categories
const seedCategories = async () => {
    try {
        console.log('Seeding categories...');
        
        // Clear existing categories
        await Category.deleteMany({});
        
        // Insert new categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Created ${createdCategories.length} categories`);
        
        return createdCategories;
    } catch (error) {
        console.error('Error seeding categories:', error);
        throw error;
    }
};

// Seed users
const seedUsers = async () => {
    try {
        console.log('Seeding users...');
        
        // Clear existing users
        await User.deleteMany({});
        
        // Insert new users
        const createdUsers = await User.insertMany(sampleUsers);
        console.log(`✅ Created ${createdUsers.length} users`);
        
        return createdUsers;
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
};

// Seed products
const seedProducts = async (createdCategories, createdUsers) => {
    try {
        console.log('Seeding products...');
        
        // Clear existing products
        await Product.deleteMany({});
        
        // Update products with actual category IDs and creator
        const productsToInsert = sampleProducts.map(product => ({
            ...product,
            createdBy: createdUsers[0]._id, // Admin user
            publishedAt: new Date()
        }));
        
        // Insert new products
        const createdProducts = await Product.insertMany(productsToInsert);
        console.log(`✅ Created ${createdProducts.length} products`);
        
        return createdProducts;
    } catch (error) {
        console.error('Error seeding products:', error);
        throw error;
    }
};

// Main seeding function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding process...');
        
        await connectDB();
        
        // Seed in order due to dependencies
        const createdCategories = await seedCategories();
        const createdUsers = await seedUsers();
        const createdProducts = await seedProducts(createdCategories, createdUsers);
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('📊 Summary:');
        console.log(`   Categories: ${createdCategories.length}`);
        console.log(`   Users: ${createdUsers.length}`);
        console.log(`   Products: ${createdProducts.length}`);
        
        console.log('\n👤 Default Admin User:');
        console.log('   Email: admin@shreeshyamcollection.com');
        console.log('   Password: admin123');
        
        console.log('\n👤 Sample Customer:');
        console.log('   Email: priya.sharma@example.com');
        console.log('   Password: user123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Clear database function
const clearDatabase = async () => {
    try {
        console.log('🧹 Clearing database...');
        
        await connectDB();
        
        await Product.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});
        
        console.log('✅ Database cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

// Handle command line arguments
const command = process.argv[2];

switch (command) {
    case 'clear':
        clearDatabase();
        break;
    case 'seed':
    default:
        seedDatabase();
        break;
}

module.exports = {
    seedDatabase,
    clearDatabase,
    seedCategories,
    seedUsers,
    seedProducts
};