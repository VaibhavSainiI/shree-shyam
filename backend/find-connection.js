const mongoose = require('mongoose');

// Common MongoDB Atlas cluster patterns to try
const testConnections = [
    // Most common patterns for MongoDB Atlas
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.hprrh.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.abcde.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.xyz12.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster1.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
    // Alternative database names
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.hprrh.mongodb.net/test?retryWrites=true&w=majority',
    'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.hprrh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
];

async function findWorkingConnection() {
    console.log('🔍 Searching for working MongoDB connection...\n');
    
    for (let i = 0; i < testConnections.length; i++) {
        const connectionString = testConnections[i];
        const maskedConnection = connectionString.replace(/\/\/.*:.*@/, '//ARYAN12345:****@');
        
        console.log(`🔗 Testing connection ${i + 1}:`);
        console.log(`   ${maskedConnection}`);
        
        try {
            await mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // 5 second timeout
            });
            
            console.log('   ✅ SUCCESS! This connection works!');
            console.log('   📊 Database:', mongoose.connection.db.databaseName);
            console.log('   🏠 Host:', mongoose.connection.host);
            
            console.log('\n🎉 WORKING CONNECTION FOUND!');
            console.log('Add this to your .env file:');
            console.log(`MONGODB_URI=${connectionString}`);
            
            await mongoose.connection.close();
            return true;
            
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message.split('\n')[0]}`);
            
            // Close any partial connections
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
            }
        }
        
        console.log('');
    }
    
    console.log('❌ No working connections found.');
    console.log('\n📋 Next Steps:');
    console.log('1. Log into your MongoDB Atlas account');
    console.log('2. Go to Clusters → Connect → Connect Application');
    console.log('3. Copy the exact connection string provided');
    console.log('4. Replace <password> with: qwertyuiop');
    console.log('5. Add your IP to Network Access whitelist');
    
    return false;
}

findWorkingConnection().then((found) => {
    if (!found) {
        process.exit(1);
    }
}).catch(console.error);