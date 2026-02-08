// src/controllers/document.controller.js
const DocumentService = require('../services/DocumentService');

// Create document
const createDocument = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.create(req.body);
        
        res.status(201).json({
            message: 'Document created',
            document
        });
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
};

// Get all documents
const getDocuments = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const documents = await service.findAll();
        
        res.status(200).json({
            count: documents.length,
            documents
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Failed to get documents' });
    }
};

// Get single document
const getDocument = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.status(200).json({ document });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ error: 'Failed to get document' });
    }
};

// Update document
const updateDocument = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.update(req.params.id, req.body);
        
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.status(200).json({
            message: 'Document updated',
            document
        });
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
};

// Archive (soft delete) document
const archiveDocument = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.archive(req.params.id);
        
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.status(200).json({
            message: 'Document archived',
            document
        });
    } catch (error) {
        console.error('Archive document error:', error);
        res.status(500).json({ error: 'Failed to archive document' });
    }
};
const smartSearch = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }
        
        const service = new DocumentService(req.tenantId, req.user._id);
        
        // 1. First, try exact matches
        const exactResults = await Document.find({
            tenantId: req.tenantId,
            isArchived: false,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { 'aiMetadata.tags': { $in: [query.toLowerCase()] } }
            ]
        }).limit(10);
        
        // 2. If no results, use AI to suggest related tags
        let suggestions = [];
        if (exactResults.length === 0) {
            const aiService = new RealAIService();
            const relatedTags = await aiService.extractTags(query);
            
            if (relatedTags.length > 0) {
                const suggestedResults = await Document.find({
                    tenantId: req.tenantId,
                    isArchived: false,
                    'aiMetadata.tags': { $in: relatedTags }
                }).limit(5);
                
                suggestions = {
                    originalQuery: query,
                    suggestedTags: relatedTags,
                    documents: suggestedResults
                };
            }
        }
        
        res.status(200).json({
            query,
            exactMatches: {
                count: exactResults.length,
                documents: exactResults.map(doc => ({
                    id: doc._id,
                    title: doc.title,
                    summary: doc.aiMetadata?.summary || doc.content.substring(0, 100),
                    tags: doc.aiMetadata?.tags || []
                }))
            },
            aiSuggestions: suggestions
        });
        
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};
const batchAnalyze = async (req, res) => {
    try {
        const { documentIds, folderId } = req.body;
        
        if (!documentIds && !folderId) {
            return res.status(400).json({ 
                error: 'Provide either documentIds array or folderId' 
            });
        }
        
        const service = new DocumentService(req.tenantId, req.user._id);
        let results;
        
        if (folderId) {
            results = await service.analyzeFolder(folderId);
        } else {
            results = await service.batchAnalyzeDocuments(documentIds);
        }
        
        res.status(200).json({
            message: 'Batch analysis completed',
            analyzedCount: results.length,
            results: results.map(r => ({
                documentId: r.documentId,
                title: r.title,
                tags: r.tags,
                sentiment: r.sentiment
            }))
        });
        
    } catch (error) {
        console.error('Batch analyze error:', error);
        res.status(500).json({ error: 'Batch analysis failed' });
    }
};

const getAICacheStats = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const stats = await service.getAICacheStats();
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Cache stats error:', error);
        res.status(500).json({ error: 'Failed to get cache stats' });
    }
};

const clearAICache = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const result = await service.clearAICache();
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Clear cache error:', error);
        res.status(500).json({ error: 'Failed to clear cache' });
    }
};

module.exports = {
    createDocument,
    getDocuments,
    getDocument,
    updateDocument,
    archiveDocument,
    smartSearch,
    batchAnalyze,
    getAICacheStats,
    clearAICache
};