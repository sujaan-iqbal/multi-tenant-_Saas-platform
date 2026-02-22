// src/routes/document.route.js
const express = require('express');
const router = express.Router();
const documentController = require('../controller/document.controller');
const { authenticate } = require('../middleware/auth');

// All document routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', documentController.createDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.archiveDocument); // Soft delete
router.post('/:id/analyze', documentController.analyzeDocument);
router.post('/batch/analyze', documentController.batchAnalyze);
router.get('/ai/cache/stats', documentController.getAICacheStats);
router.post('/ai/cache/clear', documentController.clearAICache);

// Starred routes
router.post('/:id/star', documentController.toggleStar);
router.get('/starred/all', documentController.getStarred);

// Recent routes
router.get('/recent', documentController.getRecent);

// Trash routes
router.post('/:id/trash', documentController.moveToTrash);
router.get('/trash/all', documentController.getTrash);
router.post('/:id/restore', documentController.restoreFromTrash);
router.delete('/:id/permanent', documentController.permanentlyDelete);

// Record open
router.post('/:id/open', documentController.recordOpen);


module.exports = router;