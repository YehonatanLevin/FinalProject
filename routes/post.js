const express = require('express');
const router = express.Router();
const postController = require('../controllers/post');
const { requireAuth } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/posts/new', requireAuth, postController.showCreate);
router.post('/posts', requireAuth, upload.single('image'), postController.create);
router.get('/posts/:id/edit', requireAuth, postController.showEdit);
router.post('/posts/:id/edit', requireAuth, postController.update);
router.post('/posts/:id/delete', requireAuth, postController.destroy);

module.exports = router;
