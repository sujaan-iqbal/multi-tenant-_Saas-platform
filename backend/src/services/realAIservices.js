// src/services/RealAIService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

class RealAIService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.warn('⚠️ GEMINI_API_KEY not set. Using fallback AI.');
            this.fallback = true;
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            this.fallback = false;
        }
        
        // In-memory cache (for production, use Redis)
        this.cache = new Map();
        this.requestQueue = [];
        this.processing = false;
        
        // Clean cache every hour
        setInterval(() => {
            const now = Date.now();
            for (const [key, data] of this.cache.entries()) {
                if (now - data.timestamp > 3600000) { // 1 hour
                    this.cache.delete(key);
                }
            }
        }, 60000); // Check every minute
    }
    
    // Generate cache key from content
    generateCacheKey(method, text) {
        const hash = crypto.createHash('md5').update(text).digest('hex');
        return `${method}_${hash}`;
    }
    
    // Get from cache or execute
    async cachedRequest(method, text, processor) {
        if (this.fallback || !text) {
            return processor(text);
        }
        
        const cacheKey = this.generateCacheKey(method, text);
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            console.log(`📦 Cache hit for ${method}`);
            return this.cache.get(cacheKey).data;
        }
        
        // Execute and cache
        try {
            const result = await processor(text);
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            return result;
        } catch (error) {
            console.error(`${method} failed:`, error.message);
            return this[`fallback${method.charAt(0).toUpperCase() + method.slice(1)}`](text);
        }
    }
    
    // Batch processor
    async processBatch(requests) {
        if (this.fallback || requests.length === 0) {
            return requests.map(req => this[`fallback${req.method.charAt(0).toUpperCase() + req.method.slice(1)}`](req.text));
        }
        
        // Group by method for efficiency
        const grouped = {};
        requests.forEach((req, index) => {
            if (!grouped[req.method]) {
                grouped[req.method] = [];
            }
            grouped[req.method].push({ ...req, originalIndex: index });
        });
        
        const results = new Array(requests.length);
        
        // Process each method group
        for (const [method, reqs] of Object.entries(grouped)) {
            // Process in chunks of 3 (Gemini rate limit)
            const chunkSize = 3;
            for (let i = 0; i < reqs.length; i += chunkSize) {
                const chunk = reqs.slice(i, i + chunkSize);
                const chunkResults = await Promise.allSettled(
                    chunk.map(req => this[method](req.text))
                );
                
                // Map results back to original positions
                chunkResults.forEach((result, chunkIndex) => {
                    const originalIndex = chunk[chunkIndex].originalIndex;
                    results[originalIndex] = result.status === 'fulfilled' 
                        ? result.value 
                        : this[`fallback${method.charAt(0).toUpperCase() + method.slice(1)}`](chunk[chunkIndex].text);
                });
                
                // Rate limiting: wait 1 second between chunks
                if (i + chunkSize < reqs.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        return results;
    }
    
    // Public methods with caching
    async summarize(text) {
        return this.cachedRequest('summarize', text, async (t) => {
            const prompt = `Summarize this in 2-3 sentences: ${t.substring(0, 3000)}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        });
    }
    
    async extractTags(text) {
        return this.cachedRequest('extractTags', text, async (t) => {
            const prompt = `Extract 5 keywords from this text. Return as comma list: ${t.substring(0, 2000)}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().split(',')
                .map(tag => tag.trim().toLowerCase())
                .slice(0, 5);
        });
    }
    
    async analyzeSentiment(text) {
        return this.cachedRequest('analyzeSentiment', text, async (t) => {
            const prompt = `Analyze sentiment. Respond with one word (positive/negative/neutral): ${t.substring(0, 1500)}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const sentiment = response.text().trim().toLowerCase();
            return ['positive', 'negative', 'neutral'].includes(sentiment) 
                ? sentiment 
                : 'neutral';
        });
    }
    
    // Batch analyze multiple documents
    async batchAnalyzeDocuments(documents) {
        if (!documents || documents.length === 0) return [];
        
        const requests = documents.map(doc => ({
            method: 'summarize',
            text: doc.content,
            documentId: doc._id
        }));
        
        // Add tag extraction for each doc
        const tagRequests = documents.map(doc => ({
            method: 'extractTags',
            text: doc.content,
            documentId: doc._id
        }));
        
        const sentimentRequests = documents.map(doc => ({
            method: 'analyzeSentiment',
            text: doc.content,
            documentId: doc._id
        }));
        
        // Process all in optimized batches
        const [summaries, tags, sentiments] = await Promise.all([
            this.processBatch(requests),
            this.processBatch(tagRequests),
            this.processBatch(sentimentRequests)
        ]);
        
        // Combine results by document
        return documents.map((doc, index) => ({
            documentId: doc._id,
            title: doc.title,
            summary: summaries[index],
            tags: tags[index],
            sentiment: sentiments[index],
            wordCount: doc.content.split(/\s+/).length
        }));
    }
    
    // Fallback methods
    fallbackSummarize(text) {
        if (!text || text.length < 100) return text;
        const sentences = text.split(/[.!?]+/);
        return sentences.slice(0, 2).join('. ') + '.';
    }
    
    fallbackExtractTags(text) {
        if (!text) return [];
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        const common = ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from'];
        const filtered = words.filter(word => !common.includes(word));
        
        return [...new Set(filtered)].slice(0, 5);
    }
    
    fallbackAnalyzeSentiment(text) {
        if (!text) return 'neutral';
        const positive = ['good', 'great', 'excellent', 'happy', 'success', 'well', 'positive'];
        const negative = ['bad', 'poor', 'failed', 'unhappy', 'problem', 'issue', 'negative'];
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (positive.includes(word)) score++;
            if (negative.includes(word)) score--;
        });
        
        return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    }
    
    // Clear cache (useful for testing)
    clearCache() {
        this.cache.clear();
        console.log('🧹 AI cache cleared');
    }
    
    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            methods: {
                summarize: Array.from(this.cache.keys()).filter(k => k.startsWith('summarize_')).length,
                extractTags: Array.from(this.cache.keys()).filter(k => k.startsWith('extractTags_')).length,
                analyzeSentiment: Array.from(this.cache.keys()).filter(k => k.startsWith('analyzeSentiment_')).length
            }
        };
    }
}

module.exports = RealAIService;