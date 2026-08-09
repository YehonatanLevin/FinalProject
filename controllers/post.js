const mongoose = require('mongoose');
const Post = require('../models/post');
const Group = require('../models/group');
const Route = require('../models/route');

const NEW_TITLE = 'פוסט חדש';

async function formData(user) {
    const groups = await Group.find({ members: user._id }).select('name').sort({ name: 1 });
    const routes = await Route.find().select('name city distanceKm').sort({ name: 1 }).limit(100);
    return { groups, routes };
}

exports.showCreate = async (req, res, next) => {
    try {
        const data = await formData(req.user);
        res.render('post-new', { title: NEW_TITLE, errors: [], values: { type: 'text' }, ...data });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    const { type, content, group, distanceKm, durationMin, route } = req.body;
    const values = { type, content, group, distanceKm, durationMin, route };

    const rerender = async (errors, status) => {
        const data = await formData(req.user);
        res.status(status || 400).render('post-new', { title: NEW_TITLE, errors, values, ...data });
    };

    if (req.uploadError) return rerender([req.uploadError]);

    try {
        if (group && !mongoose.Types.ObjectId.isValid(group)) {
            return rerender(['קבוצה לא תקינה']);
        }
        if (group) {
            const target = await Group.findById(group);
            if (!target || !target.hasMember(req.user._id)) {
                return rerender(['ניתן לפרסם רק בקבוצות שאתה חבר בהן'], 403);
            }
        }

        const post = new Post({
            author: req.user._id,
            type: type || 'text',
            content,
            group: group || null
        });

        if (req.file) post.image = '/uploads/' + req.file.filename;

        if (type === 'run') {
            post.run = {
                distanceKm: distanceKm === '' ? undefined : distanceKm,
                durationMin: durationMin === '' ? undefined : durationMin,
                route: route && mongoose.Types.ObjectId.isValid(route) ? route : undefined
            };
        }

        await post.save();
        res.redirect(post.group ? '/groups/' + post.group : '/');
    } catch (err) {
        if (err.name === 'ValidationError') {
            return rerender(Object.values(err.errors).map(e => e.message));
        }
        next(err);
    }
};

exports.showEdit = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', { title: 'שגיאה', message: 'מזהה פוסט לא תקין' });
    }
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).render('error', { title: 'לא נמצא', message: 'הפוסט לא נמצא' });
        }
        if (!post.isAuthor(req.user._id)) {
            return res.status(403).render('error', { title: 'אין הרשאה', message: 'ניתן לערוך רק פוסטים שכתבת' });
        }
        res.render('post-edit', { title: 'עריכת פוסט', post, errors: [] });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', { title: 'שגיאה', message: 'מזהה פוסט לא תקין' });
    }
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).render('error', { title: 'לא נמצא', message: 'הפוסט לא נמצא' });
        }
        if (!post.isAuthor(req.user._id)) {
            return res.status(403).render('error', { title: 'אין הרשאה', message: 'ניתן לערוך רק פוסטים שכתבת' });
        }

        post.content = req.body.content;
        if (post.type === 'run') {
            post.run.distanceKm = req.body.distanceKm;
            post.run.durationMin = req.body.durationMin;
        }

        await post.save();
        res.redirect('/posts/mine');
    } catch (err) {
        if (err.name === 'ValidationError') {
            const post = await Post.findById(req.params.id);
            return res.status(400).render('post-edit', {
                title: 'עריכת פוסט',
                post,
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        next(err);
    }
};

exports.destroy = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה פוסט לא תקין' });
    }
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'הפוסט לא נמצא' });

        if (!post.isAuthor(req.user._id)) {
            return res.status(403).json({ error: 'ניתן למחוק רק פוסטים שכתבת' });
        }

        await Post.deleteOne({ _id: post._id });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};
