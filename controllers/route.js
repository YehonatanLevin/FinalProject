const mongoose = require('mongoose');
const Route = require('../models/route');

const NEW_TITLE = 'מסלול חדש';
const LABELS = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };

function notFound(res) {
    return res.status(404).render('error', { title: 'לא נמצא', message: 'המסלול לא נמצא' });
}

exports.index = async (req, res, next) => {
    try {
        const routes = await Route.find()
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .limit(100);
        res.render('routes', { title: 'מסלולים', routes, labels: LABELS });
    } catch (err) {
        next(err);
    }
};

exports.showCreate = (req, res) => {
    res.render('route-new', { title: NEW_TITLE, errors: [], values: {} });
};

exports.create = async (req, res, next) => {
    const { name, description, address, lat, lng, distanceKm, difficulty, city } = req.body;
    const values = { name, description, address, lat, lng, distanceKm, difficulty, city };

    try {
        const route = await Route.create({
            name, description, address,
            lat, lng, distanceKm, difficulty, city,
            createdBy: req.user._id
        });

        if (req.xhr) return res.status(201).json({ ok: true, route });
        res.redirect('/routes/' + route._id);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            if (req.xhr) return res.status(400).json({ error: errors[0], errors });
            return res.status(400).render('route-new', { title: NEW_TITLE, errors, values });
        }
        next(err);
    }
};

exports.show = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', { title: 'שגיאה', message: 'מזהה מסלול לא תקין' });
    }
    try {
        const route = await Route.findById(req.params.id).populate('createdBy', 'fullName');
        if (!route) return notFound(res);
        res.render('route', { title: route.name, route, labels: LABELS });
    } catch (err) {
        next(err);
    }
};

exports.showEdit = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', { title: 'שגיאה', message: 'מזהה מסלול לא תקין' });
    }
    try {
        const route = await Route.findById(req.params.id);
        if (!route) return notFound(res);
        if (!route.createdBy.equals(req.user._id)) {
            return res.status(403).render('error', { title: 'אין הרשאה', message: 'ניתן לערוך רק מסלולים שיצרת' });
        }
        res.render('route-edit', { title: 'עריכת ' + route.name, route, errors: [] });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה מסלול לא תקין' });
    }
    try {
        const route = await Route.findById(req.params.id);
        if (!route) {
            if (req.xhr) return res.status(404).json({ error: 'המסלול לא נמצא' });
            return notFound(res);
        }
        if (!route.createdBy.equals(req.user._id)) {
            const msg = 'ניתן לערוך רק מסלולים שיצרת';
            if (req.xhr) return res.status(403).json({ error: msg });
            return res.status(403).render('error', { title: 'אין הרשאה', message: msg });
        }

        ['name', 'description', 'address', 'lat', 'lng', 'distanceKm', 'difficulty', 'city']
            .forEach(field => {
                if (req.body[field] !== undefined) route[field] = req.body[field];
            });

        await route.save();

        if (req.xhr) return res.json({ ok: true, route });
        res.redirect('/routes/' + route._id);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            if (req.xhr) return res.status(400).json({ error: errors[0], errors });
            return res.status(400).render('route-edit', { title: 'עריכת מסלול', route: req.body, errors });
        }
        next(err);
    }
};

exports.destroy = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה מסלול לא תקין' });
    }
    try {
        const route = await Route.findById(req.params.id);
        if (!route) return res.status(404).json({ error: 'המסלול לא נמצא' });
        if (!route.createdBy.equals(req.user._id)) {
            return res.status(403).json({ error: 'ניתן למחוק רק מסלולים שיצרת' });
        }

        await Route.deleteOne({ _id: route._id });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

exports.asJson = async (req, res, next) => {
    try {
        const routes = await Route.find()
            .select('name address lat lng distanceKm difficulty city createdBy')
            .limit(500);
        res.json({
            routes: routes.map(r => ({
                _id: r._id, name: r.name, address: r.address,
                lat: r.lat, lng: r.lng, distanceKm: r.distanceKm,
                difficulty: r.difficulty, city: r.city,
                isMine: r.createdBy.equals(req.user._id)
            }))
        });
    } catch (err) {
        next(err);
    }
};