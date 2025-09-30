const mongoose = require('mongoose');
require('dotenv').config();

// Test different MongoDB connection patterns
const connectionTests = [
    // Your original format
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    
    // Common Atlas patterns
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.cluster.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.atlas.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    
    // Try with different database names
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/test?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/?retryWrites=true&w=majority',
    
    // Alternative cluster naming patterns
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster1.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    
    // Try without SSL
    'mongodb://ARYAN12345:qwertyuiop@cluster0.mongodb.net:27017/shreeshyamcollection',
];

async function testConnection(uri, index) {
    try {
        console.log(`\n🔗 Test ${index + 1}: Attempting connection...`);
        console.log(`   URI: ${uri.replace(/:[^:@]*@/, ':****@')}`);
        
        const connection = await mongoose.createConnection(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            connectTimeoutMS: 5000,
        });
        
        console.log(`   ✅ SUCCESS! Connected to MongoDB`);
        console.log(`   📊 Database: ${connection.db.databaseName}`);
        console.log(`   🌍 Host: ${connection.host}:${connection.port}`);
        
        // Test basic operations
        const testCollection = connection.db.collection('test');
        await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
        console.log(`   ✅ Write test successful`);
        
        const doc = await testCollection.findOne({ test: 'connection' });
        console.log(`   ✅ Read test successful`);
        
        await testCollection.deleteOne({ test: 'connection' });
        console.log(`   ✅ Delete test successful`);
        
        await connection.close();
        return uri;
        
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        return null;
    }
}

async function runAllTests() {
    console.log('🧪 MongoDB Connection Testing for ARYAN12345');
    console.log('===============================================\n');
    
    let workingConnection = null;
    
    for (let i = 0; i < connectionTests.length; i++) {
        workingConnection = await testConnection(connectionTests[i], i);
        if (workingConnection) {
            break;
        }
        
        // Wait between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (workingConnection) {
        console.log('\n🎉 SUCCESS! Working connection found:');
        console.log(`   ${workingConnection.replace(/:[^:@]*@/, ':****@')}`);
        console.log('\n📝 Next steps:');
        console.log('1. Update your .env file with this working connection string');
        console.log('2. Run: npm run seed');
        console.log('3. Start your server');
    } else {
        console.log('\n❌ No working connections found.');
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check if your MongoDB Atlas cluster is created and running');
        console.log('2. Verify your credentials in MongoDB Atlas dashboard');
        console.log('3. Ensure your IP is whitelisted (Network Access → Add IP Address)');
        console.log('4. Get the exact connection string from MongoDB Atlas dashboard');
        console.log('5. Make sure your cluster isn\'t paused or sleeping');
        
        console.log('\n📋 Alternative: Create a new cluster');
        console.log('- Go to https://cloud.mongodb.com/');
        console.log('- Create new project → Build Database → Free tier');
        console.log('- Use credentials: ARYAN12345 / qwertyuiop');
        console.log('- Copy the connection string from Connect → Connect Application');
    }
    
    process.exit(workingConnection ? 0 : 1);
}

runAllTests();