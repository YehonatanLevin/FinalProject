const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { requireAuth } = require('../middleware/auth');

router.get('/profile', requireAuth, userController.profile);

module.exports = router;