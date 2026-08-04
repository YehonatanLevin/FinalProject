const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { requireAuth } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/profile', requireAuth, userController.profile);
router.get('/profile/edit', requireAuth, userController.showEdit);
router.post('/profile/edit', requireAuth, upload.single('profileImage'), userController.update);

module.exports = router;