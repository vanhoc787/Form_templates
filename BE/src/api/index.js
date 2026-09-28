const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const templatesRoutes = require('./templates.routes');
const evaluationRoutes = require('./evaluation.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/templates', templatesRoutes);
router.use('/evaluation', evaluationRoutes);


module.exports = router;