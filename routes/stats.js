const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats');
const { requireAuth } = require('../middleware/auth');

router.get('/stats', requireAuth, statsController.page);

router.get('/api/stats/km-by-group-month', requireAuth, statsController.kmByGroupPerMonth);
router.get('/api/stats/by-difficulty', requireAuth, statsController.statsByDifficulty);
router.get('/api/charts/group-km', requireAuth, statsController.chartGroupKm);
router.get('/api/charts/weekly-km', requireAuth, statsController.chartWeeklyKm);
router.get('/api/progress/monthly', requireAuth, statsController.monthlyProgress);

module.exports = router;