const mongoose = require('mongoose');
const Post = require('../models/post');
const Group = require('../models/group');
const Route = require('../models/route');
const escapeRegex = require('../utils/escapeRegex');

const LIMIT = 30;

/* חיפוש מסלולים - 4 פרמטרים: עיר, מרחק מינימלי, מרחק מקסימלי, רמת קושי */
exports.routes = async (req, res, next) => {
    const city = (req.query.city || '').trim();
    const minKm = req.query.minKm;
    const maxKm = req.query.maxKm;
    const difficulty = (req.query.difficulty || '').trim();

    const filter = {};

    if (city) {
        filter.city = new RegExp(escapeRegex(city), 'i');
    }

    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
        filter.difficulty = difficulty;
    }

    const distance = {};

    if (
        minKm !== undefined &&
        minKm !== '' &&
        !isNaN(Number(minKm))
    ) {
        distance.$gte = Number(minKm);
    }

    if (
        maxKm !== undefined &&
        maxKm !== '' &&
        !isNaN(Number(maxKm))
    ) {
        distance.$lte = Number(maxKm);
    }

    if (Object.keys(distance).length) {
        filter.distanceKm = distance;
    }

    const values = {
        city,
        minKm: minKm || '',
        maxKm: maxKm || '',
        difficulty
    };

    try {
        const routes = await Route.find(filter)
            .populate('createdBy', 'fullName')
            .sort({ distanceKm: 1 })
            .limit(LIMIT);

        if (req.xhr) {
            return res.json({
                routes,
                count: routes.length
            });
        }

        res.render('route-search', {
            title: 'חיפוש מסלולים',
            routes,
            values
        });

    } catch (err) {
        next(err);
    }
};


/* חיפוש פוסטים - 4 פרמטרים: טקסט, קבוצה, מתאריך, עד תאריך */
exports.posts = async (req, res, next) => {
    const q = (req.query.q || '').trim();
    const group = (req.query.group || '').trim();
    const from = (req.query.from || '').trim();
    const to = (req.query.to || '').trim();

    const filter = {};

    if (q) {
        filter.content = new RegExp(escapeRegex(q), 'i');
    }

    if (group && mongoose.Types.ObjectId.isValid(group)) {
        filter.group = group;
    }

    const created = {};

    if (from && !isNaN(Date.parse(from))) {
        created.$gte = new Date(from);
    }

    if (to && !isNaN(Date.parse(to))) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        created.$lte = end;
    }

    if (Object.keys(created).length) {
        filter.createdAt = created;
    }

    const values = {
        q,
        group,
        from,
        to
    };

    try {
        const [posts, groups] = await Promise.all([
            Post.find(filter)
                .populate('author', 'fullName username profileImage')
                .populate('group', 'name')
                .populate('comments.author', 'fullName profileImage')
                .sort({ createdAt: -1 })
                .limit(LIMIT),

            Group.find()
                .select('name')
                .sort({ name: 1 })
        ]);

        if (req.xhr) {
            return res.json({
                posts,
                count: posts.length
            });
        }

        res.render('post-search', {
            title: 'חיפוש פוסטים',
            posts,
            groups,
            values
        });

    } catch (err) {
        next(err);
    }
};
