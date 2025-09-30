// MongoDB Connection Test Script
const mongoose = require('mongoose');
require('dotenv').config();

const testConnections = [
    // Your provided credentials with different cluster formats
    "mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority",
    "mongodb+srv://ARYAN12345:qwertyuiop@cluster0.hprrh.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority",
    "mongodb+srv://ARYAN12345:qwertyuiop@cluster0.xqdkn.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority",
    "mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/test?retryWrites=true&w=majority",
    
    // Alternative formats
    "mongodb://ARYAN12345:qwertyuiop@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/shreeshyamcollection?ssl=true&replicaSet=atlas-12345-shard-0&authSource=admin&retryWrites=true&w=majority",
    
    // Local fallback
    "mongodb://localhost:27017/shreeshyamcollection"
];

async function testConnection(uri, index) {
    try {
        console.log(`\n🔗 Testing connection ${index + 1}:`);
        console.log(`   URI: ${uri.replace(/:[^:]*@/, ':****@')}`);
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        
        console.log(`✅ Connection ${index + 1} successful!`);
        console.log(`   Database: ${mongoose.connection.db.databaseName}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        
        // Test database operations
        const testCollection = mongoose.connection.db.collection('test');
        await testCollection.insertOne({ test: 'Connection working', timestamp: new Date() });
        console.log(`   ✅ Write test successful`);
        
        const result = await testCollection.findOne({ test: 'Connection working' });
        console.log(`   ✅ Read test successful`);
        
        await testCollection.deleteOne({ test: 'Connection working' });
        console.log(`   ✅ Delete test successful`);
        
        await mongoose.disconnect();
        return uri;
        
    } catch (error) {
        console.log(`   ❌ Connection ${index + 1} failed: ${error.message}`);
        try {
            await mongoose.disconnect();
        } catch (e) {
            // Ignore disconnect errors
        }
        return null;
    }
}

async function findWorkingConnection() {
    console.log('🔍 Testing MongoDB connections for ARYAN12345...\n');
    
    for (let i = 0; i < testConnections.length; i++) {
        const workingUri = await testConnection(testConnections[i], i);
        if (workingUri) {
            console.log(`\n🎉 Found working connection!`);
            console.log(`\nUpdate your .env file with:`);
            console.log(`MONGODB_URI=${workingUri}`);
            console.log(`\nYou can now run: npm run seed`);
            process.exit(0);
        }
    }
    
    console.log(`\n❌ No working connections found.`);
    console.log(`\nPlease check:`);
    console.log(`1. Your MongoDB Atlas cluster is running`);
    console.log(`2. Your IP address is whitelisted (or use 0.0.0.0/0 for testing)`);
    console.log(`3. Your username and password are correct`);
    console.log(`4. Get the exact connection string from MongoDB Atlas dashboard`);
    
    process.exit(1);
}

findWorkingConnection().catch(console.error);