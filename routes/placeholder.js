/*
 * דפים שעדיין לא מומשו.
 * הראוטר הזה נטען אחרון ב-app.js, ולכן הוא תופס רק כתובות
 * שאף ראוטר אמיתי לא טיפל בהן. ברגע שהבעלים של הכתובת
 * ממש אותה בקובץ שלו, היא נתפסת קודם והדף הזמני נעלם מעצמו.
 *
 * כשכל המשימות יושלמו אפשר למחוק את הקובץ ואת השורה שטוענת אותו ב-app.js.
 */
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const PENDING = [
    ['/groups', 'קבוצות', 'B'],
    ['/groups/new', 'קבוצה חדשה', 'B'],
    ['/posts/mine', 'הפוסטים שלי', 'B'],
    ['/posts/new', 'פוסט חדש', 'B'],
    ['/posts/search', 'חיפוש פוסטים', 'B'],
    ['/routes', 'מסלולים', 'C'],
    ['/routes/new', 'מסלול חדש', 'C'],
    ['/routes/search', 'חיפוש מסלולים', 'B'],
    ['/map', 'מפת מסלולים', 'C'],
    ['/stats', 'סטטיסטיקה', 'C'],
    ['/users', 'משתמשים', 'A']
];

PENDING.forEach(function (entry) {
    router.get(entry[0], requireAuth, function (req, res) {
        res.render('coming-soon', { title: entry[1], owner: entry[2] });
    });
});

module.exports = router;