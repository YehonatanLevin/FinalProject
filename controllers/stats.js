const mongoose = require('mongoose');
const Post = require('../models/post');

exports.page = (req, res) => {
    res.render('stats', { title: 'סטטיסטיקה' });
};

/*
 * אגרגציה 1 - $group
 * סך הקילומטרים בכל קבוצה, מפוצל לפי חודש.
 */
exports.kmByGroupPerMonth = async (req, res, next) => {
    try {
        const rows = await Post.aggregate([
            { $match: { type: 'run', group: { $ne: null } } },
            {
                $group: {
                    _id: {
                        group: '$group',
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalKm: { $sum: '$run.distanceKm' },
                    runCount: { $sum: 1 },
                    avgKm: { $avg: '$run.distanceKm' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $lookup: {
                    from: 'groups',
                    localField: '_id.group',
                    foreignField: '_id',
                    as: 'groupDoc'
                }
            },
            { $unwind: '$groupDoc' },
            {
                $project: {
                    _id: 0,
                    groupId: '$_id.group',
                    groupName: '$groupDoc.name',
                    year: '$_id.year',
                    month: '$_id.month',
                    totalKm: { $round: ['$totalKm', 1] },
                    avgKm: { $round: ['$avgKm', 1] },
                    runCount: 1
                }
            }
        ]);

        res.json({ rows });
    } catch (err) {
        next(err);
    }
};

/*
 * אגרגציה 2 - $group
 * מספר הדיווחים והמרחק הממוצע, לפי רמת הקושי של המסלול.
 */
exports.statsByDifficulty = async (req, res, next) => {
    try {
        const rows = await Post.aggregate([
            { $match: { type: 'run', 'run.route': { $ne: null } } },
            {
                $lookup: {
                    from: 'routes',
                    localField: 'run.route',
                    foreignField: '_id',
                    as: 'routeDoc'
                }
            },
            { $unwind: '$routeDoc' },
            {
                $group: {
                    _id: '$routeDoc.difficulty',
                    runCount: { $sum: 1 },
                    avgDistance: { $avg: '$run.distanceKm' },
                    totalDistance: { $sum: '$run.distanceKm' },
                    avgDuration: { $avg: '$run.durationMin' }
                }
            },
            { $sort: { totalDistance: -1 } },
            {
                $project: {
                    _id: 0,
                    difficulty: '$_id',
                    runCount: 1,
                    avgDistance: { $round: ['$avgDistance', 1] },
                    totalDistance: { $round: ['$totalDistance', 1] },
                    avgDuration: { $round: ['$avgDuration', 0] }
                }
            }
        ]);

        res.json({ rows });
    } catch (err) {
        next(err);
    }
};

/* גרף א' - עמודות: ק"מ לכל קבוצה בחודש הנוכחי */
exports.chartGroupKm = async (req, res, next) => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    try {
        const rows = await Post.aggregate([
            { $match: { type: 'run', group: { $ne: null }, createdAt: { $gte: start } } },
            { $group: { _id: '$group', totalKm: { $sum: '$run.distanceKm' } } },
            { $lookup: { from: 'groups', localField: '_id', foreignField: '_id', as: 'g' } },
            { $unwind: '$g' },
            { $project: { _id: 0, label: '$g.name', value: { $round: ['$totalKm', 1] } } },
            { $sort: { value: -1 } },
            { $limit: 8 }
        ]);

        res.json({ rows, month: start.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }) });
    } catch (err) {
        next(err);
    }
};

/* גרף ב' - קו: ק"מ מצטבר של המשתמש לאורך 8 השבועות האחרונים */
exports.chartWeeklyKm = async (req, res, next) => {
    const start = new Date();
    start.setDate(start.getDate() - 56);
    start.setHours(0, 0, 0, 0);

    try {
        const rows = await Post.aggregate([
            {
                $match: {
                    type: 'run',
                    author: new mongoose.Types.ObjectId(req.user._id),
                    createdAt: { $gte: start }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: '$createdAt' },
                        week: { $isoWeek: '$createdAt' }
                    },
                    weekKm: { $sum: '$run.distanceKm' }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } },
            {
                $project: {
                    _id: 0,
                    label: { $concat: ['שבוע ', { $toString: '$_id.week' }] },
                    value: { $round: ['$weekKm', 1] }
                }
            }
        ]);

        let running = 0;
        const cumulative = rows.map(r => {
            running += r.value;
            return { label: r.label, value: Math.round(running * 10) / 10, weekly: r.value };
        });

        res.json({ rows: cumulative });
    } catch (err) {
        next(err);
    }
};

/* נתוני טבעת ההתקדמות ב-canvas */
exports.monthlyProgress = async (req, res, next) => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    try {
        const rows = await Post.aggregate([
            {
                $match: {
                    type: 'run',
                    author: new mongoose.Types.ObjectId(req.user._id),
                    createdAt: { $gte: start }
                }
            },
            { $group: { _id: null, totalKm: { $sum: '$run.distanceKm' }, runs: { $sum: 1 } } }
        ]);

        const done = rows.length ? Math.round(rows[0].totalKm * 10) / 10 : 0;
        const goal = req.user.monthlyGoalKm || 0;

        res.json({
            done,
            goal,
            runs: rows.length ? rows[0].runs : 0,
            percent: goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0
        });
    } catch (err) {
        next(err);
    }
};