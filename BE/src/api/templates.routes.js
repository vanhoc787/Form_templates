const express = require('express');
const templatesController = require('../controllers/templates.controller');
const router = express.Router();

router.get('/', templatesController.list);
router.get('/:key', templatesController.get);
router.post('/', templatesController.upsert);
router.post('/bulk', templatesController.bulkAssign);
router.delete('/:key', templatesController.remove);

// NEW: import Excel -> backend xử lý
router.post('/import', templatesController.importOneMiddleware, templatesController.importOne);
router.post('/import-bulk', templatesController.importBulkMiddleware, templatesController.importBulk);

module.exports = router;