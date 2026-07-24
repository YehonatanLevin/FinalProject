const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/register', authController.showRegister);
router.post('/register', authController.register);

module.exports = router;