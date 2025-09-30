const mongoose = require('mongoose');
require('dotenv').config();

// Let's test the most promising connection that showed success
const testUri = 'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority';

async function testConnection() {
    try {
        console.log('🔗 Testing MongoDB connection...');
        console.log(`URI: ${testUri.replace(/:[^:@]*@/, ':****@')}`);
        
        // Test with mongoose.connect instead of createConnection
        await mongoose.connect(testUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        
        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🌍 Ready State: ${mongoose.connection.readyState}`);
        
        // Test basic database operations
        const testCollection = mongoose.connection.db.collection('connectionTest');
        
        console.log('\n🧪 Testing database operations...');
        
        // Insert test
        const insertResult = await testCollection.insertOne({ 
            test: 'connection', 
            timestamp: new Date(),
            message: 'MongoDB connection successful!'
        });
        console.log('✅ Insert test passed');
        
        // Read test
        const doc = await testCollection.findOne({ test: 'connection' });
        console.log('✅ Read test passed');
        console.log(`   Document: ${JSON.stringify(doc, null, 2)}`);
        
        // Update test
        await testCollection.updateOne(
            { test: 'connection' },
            { $set: { updated: true } }
        );
        console.log('✅ Update test passed');
        
        // Delete test
        await testCollection.deleteOne({ test: 'connection' });
        console.log('✅ Delete test passed');
        
        console.log('\n🎉 ALL TESTS PASSED! MongoDB is working perfectly!');
        console.log('\n📝 Next steps:');
        console.log('1. Your MongoDB connection is working');
        console.log('2. Run: npm run seed (to populate with sample data)');
        console.log('3. Start your backend server');
        
        await mongoose.disconnect();
        return true;
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n🔧 DNS Resolution Failed:');
            console.log('- Your cluster URL might be incorrect');
            console.log('- Check your MongoDB Atlas dashboard for the correct connection string');
        } else if (error.message.includes('authentication')) {
            console.log('\n🔧 Authentication Failed:');
            console.log('- Check your username and password');
            console.log('- Ensure user ARYAN12345 exists in your cluster');
        } else if (error.message.includes('IP')) {
            console.log('\n🔧 IP Not Whitelisted:');
            console.log('- Add your IP to Network Access in MongoDB Atlas');
            console.log('- Or add 0.0.0.0/0 for testing');
        }
        
        return false;
    }
}

// Test alternative connection strings if main one fails
async function testAlternatives() {
    const alternatives = [
        'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.cluster.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
        'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.atlas.mongodb.net/shreeshyamcollection?retryWrites=true&w=majority',
        'mongodb+srv://ARYAN12345:qwertyuiop@cluster0.mongodb.net/test?retryWrites=true&w=majority'
    ];
    
    for (let i = 0; i < alternatives.length; i++) {
        console.log(`\n🔄 Trying alternative ${i + 1}...`);
        try {
            await mongoose.connect(alternatives[i], {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
            });
            
            console.log(`✅ Alternative ${i + 1} works!`);
            console.log(`Working URI: ${alternatives[i].replace(/:[^:@]*@/, ':****@')}`);
            await mongoose.disconnect();
            return alternatives[i];
        } catch (error) {
            console.log(`❌ Alternative ${i + 1} failed: ${error.message}`);
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
        }
    }
    return null;
}

async function main() {
    console.log('🚀 MongoDB Connection Test for Shree Shyam Collection');
    console.log('=================================================\n');
    
    const success = await testConnection();
    
    if (!success) {
        console.log('\n🔄 Trying alternative connection strings...');
        const workingUri = await testAlternatives();
        
        if (workingUri) {
            console.log('\n✅ Found working connection! Update your .env file with:');
            console.log(`MONGODB_URI=${workingUri}`);
        } else {
            console.log('\n❌ All connection attempts failed');
            console.log('\n📋 Please check your MongoDB Atlas setup:');
            console.log('1. Go to https://cloud.mongodb.com/');
            console.log('2. Ensure your cluster is running (not paused)');
            console.log('3. Network Access → Add IP Address → Add Current IP');
            console.log('4. Database Access → Ensure user ARYAN12345 exists');
            console.log('5. Clusters → Connect → Connect Application → Copy connection string');
        }
    }
    
    process.exit(success ? 0 : 1);
}

main();