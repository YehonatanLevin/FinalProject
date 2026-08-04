const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { requireAuth } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/profile', requireAuth, userController.profile);
router.get('/profile/edit', requireAuth, userController.showEdit);
router.post('/profile/edit', requireAuth, upload.single('profileImage'), userController.update);

router.get('/users', requireAuth, userController.list);
router.get('/users/:id', requireAuth, userController.showUser);

router.post('/friends/:id/add', requireAuth, userController.addFriend);
router.post('/friends/:id/remove', requireAuth, userController.removeFriend);

module.exports = router;