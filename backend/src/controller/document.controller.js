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

const analyzeDocument = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        await service.analyzeDocument(req.params.id);
        
        const document = await service.findById(req.params.id);
        
        res.status(200).json({
            message: 'Document analyzed',
            aiMetadata: document.aiMetadata
        });
    } catch (error) {
        console.error('Analyze error:', error);
        res.status(500).json({ error: 'Analysis failed' });
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
// Toggle star
const toggleStar = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.toggleStar(req.params.id);
        
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.status(200).json({
            message: document.isStarred ? 'Document starred' : 'Document unstarred',
            document
        });
    } catch (error) {
        console.error('Toggle star error:', error);
        res.status(500).json({ error: 'Failed to toggle star' });
    }
};

// Get starred
const getStarred = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const documents = await service.getStarred();
        
        res.status(200).json({
            count: documents.length,
            documents
        });
    } catch (error) {
        console.error('Get starred error:', error);
        res.status(500).json({ error: 'Failed to get starred documents' });
    }
};

// Get recent by days
const getRecent = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const service = new DocumentService(req.tenantId, req.user._id);
        const documents = await service.getRecent(parseInt(days));
        
        res.status(200).json({
            days: parseInt(days),
            count: documents.length,
            documents
        });
    } catch (error) {
        console.error('Get recent error:', error);
        res.status(500).json({ error: 'Failed to get recent documents' });
    }
};

// Move to trash
const moveToTrash = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.moveToTrash(req.params.id);
        
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.status(200).json({
            message: 'Document moved to trash',
            document
        });
    } catch (error) {
        console.error('Move to trash error:', error);
        res.status(500).json({ error: 'Failed to move document to trash' });
    }
};

// Get trash
const getTrash = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const documents = await service.getTrash();
        
        res.status(200).json({
            count: documents.length,
            documents
        });
    } catch (error) {
        console.error('Get trash error:', error);
        res.status(500).json({ error: 'Failed to get trash' });
    }
};

// Restore from trash
const restoreFromTrash = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.restoreFromTrash(req.params.id);
        
        if (!document) {
            return res.status(404).json({ error: 'Document not found in trash' });
        }
        
        res.status(200).json({
            message: 'Document restored',
            document
        });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: 'Failed to restore document' });
    }
};

// Permanently delete
const permanentlyDelete = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        const document = await service.permanentlyDelete(req.params.id);
        
        if (!document) {
            return res.status(404).json({ error: 'Document not found in trash' });
        }
        
        res.status(200).json({
            message: 'Document permanently deleted'
        });
    } catch (error) {
        console.error('Permanent delete error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};

// Record document open
const recordOpen = async (req, res) => {
    try {
        const service = new DocumentService(req.tenantId, req.user._id);
        await service.recordOpen(req.params.id);
        res.status(200).json({ message: 'Open recorded' });
    } catch (error) {
        console.error('Record open error:', error);
        res.status(500).json({ error: 'Failed to record open' });
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
    clearAICache,
    analyzeDocument,
    toggleStar,
    getStarred,
    getRecent,
    moveToTrash,
    getTrash,
    restoreFromTrash,
    permanentlyDelete,
    recordOpen
};