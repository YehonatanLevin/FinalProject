const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');
const feedController = require('../controllers/feed');

router.get('/', (req, res, next) => {
    if (req.user) return feedController.index(req, res, next);
    homeController.index(req, res);
});
router.get('/about', homeController.about);

module.exports = router;