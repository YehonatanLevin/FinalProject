const express = require('express');
const router = express.Router();
const shareController = require('../controllers/share');
const { requireAuth } = require('../middleware/auth');

router.post('/posts/:id/share/facebook', requireAuth, shareController.toFacebook);

module.exports = router;