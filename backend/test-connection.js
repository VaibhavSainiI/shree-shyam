const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
    console.log('🔍 Testing MongoDB Connection...\n');
    
    const connectionString = process.env.MONGODB_URI;
    console.log('Connection String:', connectionString ? connectionString.replace(/\/\/.*:.*@/, '//****:****@') : 'Not found in .env');
    
    try {
        console.log('⏳ Attempting to connect...');
        
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 second timeout
        });
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log('📊 Connection Details:');
        console.log('   - Database:', mongoose.connection.db.databaseName);
        console.log('   - Host:', mongoose.connection.host);
        console.log('   - Port:', mongoose.connection.port);
        console.log('   - Ready State:', mongoose.connection.readyState); // 1 = connected
        
        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Available Collections:', collections.map(c => c.name));
        
        await mongoose.connection.close();
        console.log('🔒 Connection closed successfully');
        
    } catch (error) {
        console.log('❌ MongoDB Connection Failed!');
        console.log('Error Type:', error.constructor.name);
        console.log('Error Message:', error.message);
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n🔧 Troubleshooting Tips:');
            console.log('1. Check if your cluster URL is correct');
            console.log('2. Verify your MongoDB Atlas cluster is running');
            console.log('3. Check your internet connection');
        } else if (error.message.includes('authentication failed')) {
            console.log('\n🔧 Troubleshooting Tips:');
            console.log('1. Verify username and password are correct');
            console.log('2. Check if user has proper database permissions');
        } else if (error.message.includes('IP')) {
            console.log('\n🔧 Troubleshooting Tips:');
            console.log('1. Add your IP address to MongoDB Atlas whitelist');
            console.log('2. Go to Network Access > Add IP Address');
            console.log('3. Use 0.0.0.0/0 for testing (allow all IPs)');
        }
        
        process.exit(1);
    }
}

testMongoConnection();