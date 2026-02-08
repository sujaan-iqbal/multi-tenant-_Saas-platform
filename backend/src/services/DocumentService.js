// src/services/DocumentService.js

const { Document } = require('../models');
const RealAIService = require('./realAIservices');

const ONE_HOUR = 60 * 60 * 1000;

class DocumentService {
    constructor(tenantId, userId) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.aiService = new RealAIService();
        this.analysisQueue = new Map(); // Prevent duplicate AI runs
    }

    /* ============================== CRUD ============================== */

    async create(data) {
        const document = await Document.create({
            ...data,
            tenantId: this.tenantId,
            createdBy: this.userId,
            lastEditedBy: this.userId
        });

        // Fire-and-forget AI
        this.analyzeDocument(document._id).catch(() => {});
        return document;
    }

    async findById(id) {
        return Document.findOne({
            _id: id,
            tenantId: this.tenantId,
            isArchived: false
        });
    }

    async findAll(query = {}) {
        return Document.find({
            ...query,
            tenantId: this.tenantId,
            isArchived: false
        }).sort({ updatedAt: -1 });
    }

    async update(id, data) {
        const document = await Document.findOneAndUpdate(
            { _id: id, tenantId: this.tenantId },
            { ...data, lastEditedBy: this.userId },
            { new: true }
        );

        if (document) {
            this.analyzeDocument(id).catch(() => {});
        }

        return document;
    }

    async archive(id) {
        return Document.findOneAndUpdate(
            { _id: id, tenantId: this.tenantId },
            { isArchived: true },
            { new: true }
        );
    }

    async getUserDocuments() {
        return this.findAll({ createdBy: this.userId });
    }

    async getFolderContents(parentId = null) {
        return this.findAll({ parentId });
    }

    /* ============================ AI CORE ============================ */

    async analyzeDocument(documentId, forceRefresh = false) {
        if (this.analysisQueue.has(documentId)) {
            return this.analysisQueue.get(documentId);
        }

        const promise = this._performAnalysis(documentId, forceRefresh);
        this.analysisQueue.set(documentId, promise);

        promise.finally(() => this.analysisQueue.delete(documentId));
        return promise;
    }

    async _performAnalysis(documentId, forceRefresh) {
        try {
            const document = await Document.findOne({
                _id: documentId,
                tenantId: this.tenantId
            });

            if (!document?.content || document.content.length < 20) return null;

            const lastAnalyzed = document.aiMetadata?.lastAnalyzed;
            const recentlyAnalyzed =
                lastAnalyzed &&
                Date.now() - new Date(lastAnalyzed).getTime() < ONE_HOUR;

            if (recentlyAnalyzed && !forceRefresh) {
                return document.aiMetadata;
            }

            const [summary, tags, sentiment] = await Promise.allSettled([
                this.aiService.summarize(document.content),
                this.aiService.extractTags(document.content),
                this.aiService.analyzeSentiment(document.content)
            ]);

            const updates = {
                'aiMetadata.lastAnalyzed': new Date(),
                'aiMetadata.wordCount': document.content.split(/\s+/).length,
                'aiMetadata.charCount': document.content.length
            };

            if (summary.status === 'fulfilled')
                updates['aiMetadata.summary'] = summary.value;

            if (tags.status === 'fulfilled')
                updates['aiMetadata.tags'] = tags.value;

            if (sentiment.status === 'fulfilled')
                updates['aiMetadata.sentiment'] = sentiment.value;

            await Document.findByIdAndUpdate(documentId, updates);
            return updates;

        } catch (err) {
            console.error('AI analysis failed:', err.message);
            return null; // AI is non-critical
        }
    }

    /* ============================ BATCH ============================ */

    async batchAnalyzeDocuments(documentIds, forceRefresh = false) {
        if (!Array.isArray(documentIds) || documentIds.length === 0) return [];

        const documents = await Document.find({
            _id: { $in: documentIds },
            tenantId: this.tenantId,
            isArchived: false
        });

        if (!documents.length) return [];

        const results = await this.aiService.batchAnalyzeDocuments(documents);

        const updates = results.map(r =>
            r.documentId
                ? Document.findByIdAndUpdate(r.documentId, {
                      'aiMetadata.summary': r.summary,
                      'aiMetadata.tags': r.tags,
                      'aiMetadata.sentiment': r.sentiment,
                      'aiMetadata.wordCount': r.wordCount,
                      'aiMetadata.lastAnalyzed': new Date()
                  })
                : null
        );

        await Promise.allSettled(updates);
        return results;
    }

    async analyzeFolder(folderId) {
        const docs = await Document.find({
            tenantId: this.tenantId,
            parentId: folderId,
            isArchived: false
        });

        return this.batchAnalyzeDocuments(docs.map(d => d._id));
    }

    /* ============================ CACHE ============================ */

    getAICacheStats() {
        return this.aiService.getCacheStats();
    }

    clearAICache() {
        this.aiService.clearCache();
        return { message: 'AI cache cleared' };
    }
}

module.exports = DocumentService;
