const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { requireGuest, requireAuth } = require('../middleware/auth');

router.get('/register', requireGuest, authController.showRegister);
router.post('/register', requireGuest, authController.register);
router.get('/login', requireGuest, authController.showLogin);
router.post('/login', requireGuest, authController.login);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;