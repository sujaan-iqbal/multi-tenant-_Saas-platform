// // test-simple.js
// require('dotenv').config();
// const mongoose = require('mongoose');

// console.log('Testing Mongoose 7+ connection...');

// // Simplest possible connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log('Connected!');
//         console.log('Database:', mongoose.connection.db.databaseName);
//         mongoose.disconnect();
//         process.exit(0);
//     })
//     .catch(err => {
//         console.log('Error:', err.message);
//         process.exit(1);
//     });

// const jwt= require('./src/utils/jwt')
// const brcrypt= require('./src/utils/bcrypt')
// console.log("testing utilities...")

// middleware testing

// test-middleware.js
// Test the authentication flow
// test-jwt-fixed.js
// test-all.js
// test-route-setup.js




// const express = require('express');
// const app = express();

// // Test if middleware works
// const testAuth = (req, res, next) => {
//     console.log('Test middleware called');
//     req.user = { id: 'test-user', tenantId: 'test-tenant' };
//     next();
// };

// // Test route
// app.get('/api/auth/test-me', testAuth, (req, res) => {
//     res.json({ 
//         message: 'Test route works',
//         user: req.user 
//     });
// });

// app.listen(3001, () => {
//     console.log('Test server on http://localhost:3001');
//     console.log('Test: curl http://localhost:3001/api/auth/test-me');
// });



// get-token-simple.js - No dependencies
// get-token.js
// require('dotenv').config();
// const axios = require('axios');

// async function getFreshToken() {
//     try {
//         console.log('Registering new user to get fresh token...\n');
        
//         const response = await axios.post('http://localhost:3000/api/auth/register', {
//             companyName: 'Debug Company',
//             email: `debug${Date.now()}@test.com`,
//             password: 'Debug123!'
//         });
        
//         console.log('✅ Registration successful!\n');
        
//         const token = response.data.token;
        
//         console.log('=== FULL TOKEN ===');
//         console.log(token);
//         console.log('\n=== TOKEN INFO ===');
//         console.log('Length:', token.length, 'characters');
//         console.log('Starts with:', token.substring(0, 20));
//         console.log('Ends with:', token.substring(token.length - 20));
//         console.log('Dots:', (token.match(/\./g) || []).length);
//         console.log('\n=== TEST THIS TOKEN ===');
//         console.log('curl -H "Authorization: Bearer ' + token + '" http://localhost:3000/api/auth/me');
        
//         return token;
        
//     } catch (error) {
//         console.error('❌ Failed to get token:', error.response?.data || error.message);
//     }
// }

// getFreshToken();


// CHECKING DOCUMENT API
// require('dotenv').config();

// async function testDocuments() {
//     console.log('🧪 Testing Documents API...\n');
    
//     // 1. First register/login to get token
//     const { default: axios } = await import('axios');
    
//     try {
//         // Register a test user
//         console.log('1. Registering test user...');
//         const registerRes = await axios.post('http://localhost:3000/api/auth/register', {
//             companyName: 'Document Test Inc',
//             email: 'docuser@test.com',
//             password: 'Test123!'
//         });
        
//         const token = registerRes.data.token;
//         console.log('✅ Token obtained');
        
//         // 2. Create a document
//         console.log('\n2. Creating document...');
//         const createRes = await axios.post('http://localhost:3000/api/documents', {
//             title: 'My First Document',
//             content: '## Welcome to our SaaS\nThis is a test document.',
//             isFolder: false
//         }, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
        
//         const docId = createRes.data.document._id;
//         console.log('✅ Document created:', createRes.data.document.title);
        
//         // 3. Get all documents
//         console.log('\n3. Getting all documents...');
//         const listRes = await axios.get('http://localhost:3000/api/documents', {
//             headers: { Authorization: `Bearer ${token}` }
//         });
        
//         console.log(`✅ Found ${listRes.data.count} documents`);
        
//         // 4. Get single document
//         console.log('\n4. Getting single document...');
//         const singleRes = await axios.get(`http://localhost:3000/api/documents/${docId}`, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
        
//         console.log('✅ Document retrieved:', singleRes.data.document.title);
        
//         // 5. Update document
//         console.log('\n5. Updating document...');
//         const updateRes = await axios.put(`http://localhost:3000/api/documents/${docId}`, {
//             title: 'Updated Document Title',
//             content: '## Updated content\nWith new information.'
//         }, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
        
//         console.log('✅ Document updated:', updateRes.data.document.title);
        
//         // 6. Archive document
//         console.log('\n6. Archiving document...');
//         const archiveRes = await axios.delete(`http://localhost:3000/api/documents/${docId}`, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
        
//         console.log('✅ Document archived:', archiveRes.data.document.isArchived);
        
//         console.log('\n🎉 All document tests passed!');
        
//     } catch (error) {
//         console.error('❌ Test failed:', error.response?.data || error.message);
//     }
// }

// testDocuments();


// CHECKING AI SERVICE
// test-gemini.js
// require('dotenv').config();
// const RealAIService = require('./src/services/realAIservices');

// async function testGemini() {
//     console.log('🧪 Testing Gemini AI...\n');
    
//     const ai = new RealAIService();
    
//     const testText = `Our quarterly sales report shows excellent performance. 
//                      Revenue increased by 25% compared to last quarter, reaching $5.2 million.
//                      The new marketing campaign was highly successful, generating many leads.
//                      However, we faced supply chain issues that delayed some shipments.
//                      Customer feedback has been very positive about our new features.`;
    
//     console.log('Test Text:', testText.substring(0, 150) + '...\n');
    
//     try {
//         console.log('1. Testing summarization...');
//         const summary = await ai.summarize(testText);
//         console.log('✅ Summary:', summary);
        
//         console.log('\n2. Testing tag extraction...');
//         const tags = await ai.extractTags(testText);
//         console.log('✅ Tags:', tags);
        
//         console.log('\n3. Testing sentiment analysis...');
//         const sentiment = await ai.analyzeSentiment(testText);
//         console.log('✅ Sentiment:', sentiment);
        
//         console.log('\n🎉 Gemini AI is working!');
//         console.log('\n💡 Add to .env: GEMINI_API_KEY=your_key_here');
        
//     } catch (error) {
//         console.error('❌ Test failed:', error.message);
//         console.log('\n⚠️ Using fallback AI (no API key needed)');
        
//         // Test fallback
//         console.log('Fallback summary:', ai.fallbackSummarize(testText));
//         console.log('Fallback tags:', ai.fallbackExtractTags(testText));
//         console.log('Fallback sentiment:', ai.fallbackAnalyzeSentiment(testText));
//     }
// }

// testGemini();

// CHECKING BATCH AI ANALYSIS
// test-batch-ai.js
require('dotenv').config();
const axios = require('axios');

async function testBatchAI() {
    console.log('🧪 Testing Batch AI Features...\n');
    
    try {
        // 1. Register
        const registerRes = await axios.post('http://localhost:3000/api/auth/register', {
            companyName: 'Batch AI Test',
            email: `batch${Date.now()}@test.com`,
            password: 'Batch123!'
        });
        
        const token = registerRes.data.token;
        console.log('✅ Registered');
        
        // 2. Create multiple documents
        const documents = [
            {
                title: 'Sales Report Q1',
                content: 'Sales were excellent this quarter. We exceeded targets by 15%.'
            },
            {
                title: 'Marketing Strategy',
                content: 'Our new campaign focuses on social media. Budget increased by 20%.'
            },
            {
                title: 'Product Feedback',
                content: 'Users reported bugs in the mobile app. Fix scheduled for next week.'
            }
        ];
        
        const createdDocs = [];
        for (const doc of documents) {
            const createRes = await axios.post('http://localhost:3000/api/documents', doc, {
                headers: { Authorization: `Bearer ${token}` }
            });
            createdDocs.push(createRes.data.document);
        }
        
        console.log(`✅ Created ${createdDocs.length} documents`);
        
        // Wait for auto-analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. Test batch analyze
        const docIds = createdDocs.map(doc => doc._id);
        const batchRes = await axios.post('http://localhost:3000/api/documents/batch/analyze', {
            documentIds: docIds
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n🎯 BATCH ANALYSIS RESULTS:');
        console.log(`Analyzed: ${batchRes.data.analyzedCount} documents`);
        batchRes.data.results.forEach((result, i) => {
            console.log(`\n${i + 1}. ${result.title}`);
            console.log(`   Tags: ${result.tags.join(', ')}`);
            console.log(`   Sentiment: ${result.sentiment}`);
        });
        
        // 4. Test cache stats
        const cacheRes = await axios.get('http://localhost:3000/api/documents/ai/cache/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n📊 CACHE STATS:');
        console.log('Total cached items:', cacheRes.data.size);
        console.log('By method:', cacheRes.data.methods);
        
        console.log('\n🎉 Batch AI features working!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testBatchAI();