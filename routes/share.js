/* שלד. A ממלא אותו במשימה A11. */
const express = require('express');
const router = express.Router();

router.post('/posts/:id/share/facebook', (req, res) => {
    res.status(503).json({ error: 'שיתוף לפייסבוק עדיין לא מומש' });
});

module.exports = router;