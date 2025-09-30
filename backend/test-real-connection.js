const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = 'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.asqowqt.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
    try {
        console.log('🔗 Testing MongoDB connection with your cluster...');
        console.log(`URI: mongodb+srv://ARYAN12345:****@cluster0.asqowqt.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority&appName=Cluster0`);
        
        // Connect to MongoDB
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        
        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🌍 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
        console.log(`🏷️  Cluster: cluster0.asqowqt.mongodb.net`);
        
        // Test database operations
        console.log('\n🧪 Testing database operations...');
        
        const testCollection = mongoose.connection.db.collection('connectionTest');
        
        // Insert test
        const insertResult = await testCollection.insertOne({ 
            test: 'connection', 
            timestamp: new Date(),
            message: 'Shree Shyam Collection MongoDB is working!',
            user: 'ARYAN12345'
        });
        console.log('✅ Insert test passed');
        console.log(`   Inserted ID: ${insertResult.insertedId}`);
        
        // Read test
        const doc = await testCollection.findOne({ test: 'connection' });
        console.log('✅ Read test passed');
        console.log(`   Found document: ${doc.message}`);
        
        // Update test
        await testCollection.updateOne(
            { test: 'connection' },
            { $set: { updated: true, updateTime: new Date() } }
        );
        console.log('✅ Update test passed');
        
        // Count test
        const count = await testCollection.countDocuments({ test: 'connection' });
        console.log(`✅ Count test passed - Found ${count} document(s)`);
        
        // Delete test
        await testCollection.deleteOne({ test: 'connection' });
        console.log('✅ Delete test passed');
        
        console.log('\n🎉 ALL TESTS PASSED! MongoDB is working perfectly!');
        console.log('\n📝 Next steps:');
        console.log('1. ✅ MongoDB connection is confirmed working');
        console.log('2. 🌱 Run: npm run seed (to populate with ethnic wear products)');
        console.log('3. 🚀 Start backend server: node server-clean.js');
        console.log('4. 🌐 Access full website with database: http://localhost:5000');
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        return true;
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        
        if (error.message.includes('authentication')) {
            console.log('\n🔧 Authentication Error:');
            console.log('- Username or password might be incorrect');
            console.log('- Check MongoDB Atlas Database Access settings');
        } else if (error.message.includes('IP')) {
            console.log('\n🔧 IP Whitelist Error:');
            console.log('- Add your current IP to Network Access in MongoDB Atlas');
            console.log('- Or temporarily add 0.0.0.0/0 for testing');
        } else {
            console.log('\n🔧 Other Error:');
            console.log('- Check if cluster is running and not paused');
            console.log('- Verify network connectivity');
        }
        
        return false;
    }
}

console.log('🚀 MongoDB Connection Test - Shree Shyam Collection');
console.log('================================================\n');

testConnection().then(success => {
    process.exit(success ? 0 : 1);
});