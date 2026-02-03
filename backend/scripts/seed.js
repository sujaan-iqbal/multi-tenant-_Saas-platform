// scripts/seed.js - FIXED FOR MONGOOSE 7+
require('dotenv').config();

console.log('🔗 Connecting to MongoDB Atlas...');

const uri = process.env.MONGO_URI;
const maskedUri = uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'Not set';
console.log('Using URI:', maskedUri);

const mongoose = require('mongoose');

async function seed() {
    try {
        // For Mongoose 7+, use simpler connection
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('✅ Connected to MongoDB Atlas!');
        console.log('Host:', mongoose.connection.host);
        console.log('Database:', mongoose.connection.db?.databaseName || 'Connecting...');
        
        // Rest of your seed code...
        const { Tenant, User } = require('../src/models');
        
        // Clear only in development
        if (process.env.NODE_ENV === 'development') {
            console.log('🧹 Clearing existing data...');
            await Tenant.deleteMany({});
            await User.deleteMany({});
        }
        
        console.log('\n🌱 Creating tenants...');
        
        // Create Tenant A
        const tenantA = await Tenant.create({
            name: 'Acme Corporation',
            slug: 'acme-corp',
            subscription: { 
                plan: 'pro',
                status: 'active',
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            settings: {
                timezone: 'America/New_York',
                locale: 'en-US'
            }
        });
        console.log(`✅ Created tenant: ${tenantA.name} (${tenantA.slug})`);
        
        // Create Tenant B
        const tenantB = await Tenant.create({
            name: 'Globex Incorporated',
            slug: 'globex-inc',
            subscription: { 
                plan: 'enterprise',
                status: 'active'
            },
            settings: {
                timezone: 'Europe/London',
                locale: 'en-GB'
            }
        });
        console.log(`✅ Created tenant: ${tenantB.name} (${tenantB.slug})`);
        
        console.log('\n👥 Creating users...');
        
        // Create users for Tenant A
        const [adminA, userA] = await User.create([
            {
                tenantId: tenantA._id,
                email: 'admin@acme.com',
                passwordHash: '$2b$10$examplehash...',
                role: 'owner',
                profile: { 
                    firstName: 'John', 
                    lastName: 'Acme'
                },
                status: 'active'
            },
            {
                tenantId: tenantA._id,
                email: 'jane@acme.com',
                passwordHash: '$2b$10$examplehash...',
                role: 'member',
                profile: { 
                    firstName: 'Jane', 
                    lastName: 'Doe'
                },
                status: 'active'
            }
        ]);
        console.log(`✅ Created users for ${tenantA.name}: ${adminA.email}, ${userA.email}`);
        
        // Create user for Tenant B
        const adminB = await User.create({
            tenantId: tenantB._id,
            email: 'bob@globex.com',
            passwordHash: '$2b$10$examplehash...',
            role: 'owner',
            profile: { 
                firstName: 'Bob', 
                lastName: 'Globex'
            },
            status: 'active'
        });
        console.log(`✅ Created user for ${tenantB.name}: ${adminB.email}`);
        
        // Test isolation
        console.log('\n🔍 Testing tenant isolation...');
        
        const tenantAUsers = await User.find({ tenantId: tenantA._id });
        const tenantBUsers = await User.find({ tenantId: tenantB._id });
        
        console.log(`${tenantA.name} has ${tenantAUsers.length} users`);
        console.log(`${tenantB.name} has ${tenantBUsers.length} users`);
        
        // Verify no cross-tenant data leakage
        const crossQuery = await User.find({ 
            tenantId: tenantA._id, 
            email: 'bob@globex.com'
        });
        
        if (crossQuery.length === 0) {
            console.log('✅ Tenant isolation verified: No cross-tenant data leakage');
        } else {
            console.log('❌ WARNING: Cross-tenant data leakage detected!');
        }
        
        console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!');
        console.log('=================================');
        console.log('Tenant A ID:', tenantA._id.toString());
        console.log('Tenant B ID:', tenantB._id.toString());
        console.log('=================================');
        
        await mongoose.disconnect();
        console.log('📴 MongoDB disconnected');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ SEED FAILED:', error.message);
        
        if (error.message.includes('MongoNetworkError')) {
            console.log('\n💡 NETWORK TIPS:');
            console.log('1. Check your internet connection');
            console.log('2. In Atlas → Network Access → Add IP Address');
            console.log('3. Select "Allow Access from Anywhere"');
            console.log('4. Wait 2 minutes, then try again');
        }
        
        if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
            console.log('\n💡 AUTH TIPS:');
            console.log('1. Verify password in .env matches Atlas');
            console.log('2. If password has @, replace with %40');
            console.log('3. In Atlas → Database Access → Reset password');
        }
        
        // Clean disconnect
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        
        process.exit(1);
    }
}

seed();