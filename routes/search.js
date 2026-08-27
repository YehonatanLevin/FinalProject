const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');
const { requireAuth } = require('../middleware/auth');

router.get('/routes/search', requireAuth, searchController.routes);
router.get('/posts/search', requireAuth, searchController.posts);

module.exports = router;
