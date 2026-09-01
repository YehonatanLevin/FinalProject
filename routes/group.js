const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group');
const { requireAuth } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/groups', requireAuth, groupController.index);
router.get('/groups/new', requireAuth, groupController.showCreate);
router.post('/groups', requireAuth, upload.single('coverImage'), groupController.create);

router.get('/groups/:id', requireAuth, groupController.show);
router.get('/groups/:id/edit', requireAuth, groupController.showEdit);
router.get('/groups/:id/members/search', requireAuth, groupController.searchMembers);
router.post('/groups/:id/edit', requireAuth, upload.single('coverImage'), groupController.update);
router.post('/groups/:id/delete', requireAuth, groupController.destroy);

router.post('/groups/:id/join', requireAuth, groupController.join);
router.post('/groups/:id/leave', requireAuth, groupController.leave);

module.exports = router;
