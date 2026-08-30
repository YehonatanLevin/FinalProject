const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route');
const mapController = require('../controllers/map');
const { requireAuth } = require('../middleware/auth');

router.get('/map', requireAuth, mapController.index);

router.get('/routes', requireAuth, routeController.index);
router.get('/routes/new', requireAuth, routeController.showCreate);
router.get('/routes/json', requireAuth, routeController.asJson);
router.post('/routes', requireAuth, routeController.create);
router.get('/routes/:id', requireAuth, routeController.show);
router.get('/routes/:id/edit', requireAuth, routeController.showEdit);
router.post('/routes/:id/edit', requireAuth, routeController.update);
router.post('/routes/:id/delete', requireAuth, routeController.destroy);

module.exports = router;