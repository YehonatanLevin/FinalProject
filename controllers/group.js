const mongoose = require('mongoose');
const Group = require('../models/group');
const Post = require('../models/post');
const escapeRegex = require('../utils/escapeRegex');

const NEW_TITLE = 'קבוצה חדשה';

function notFound(res) {
    return res.status(404).render('error', {
        title: 'לא נמצא',
        message: 'הקבוצה לא נמצאה'
    });
}

exports.index = async (req, res, next) => {
    const city = (req.query.city || '').trim();
    const filter = city ? { city: new RegExp(escapeRegex(city), 'i') } : {};

    try {
        const groups = await Group.find(filter)
            .populate('creator', 'fullName')
            .sort({ createdAt: -1 })
            .limit(50);

        res.render('groups', {
            title: 'קבוצות',
            groups,
            values: { city },
            myGroupIds: (req.user ? req.user._id : null)
                ? groups.filter(g => g.hasMember(req.user._id)).map(g => String(g._id))
                : []
        });
    } catch (err) {
        next(err);
    }
};

exports.showCreate = (req, res) => {
    res.render('group-new', {
        title: NEW_TITLE,
        errors: [],
        values: {}
    });
};

exports.create = async (req, res, next) => {
    const { name, description, city } = req.body;
    const values = { name, description, city };

    if (req.uploadError) {
        return res.status(400).render('group-new', {
            title: NEW_TITLE,
            errors: [req.uploadError],
            values
        });
    }

    try {
        const group = new Group({
            name,
            description,
            city,
            creator: req.user._id,
            members: [req.user._id]
        });

        if (req.file) {
            group.coverImage = '/uploads/' + req.file.filename;
        }

        await group.save();
        res.redirect('/groups/' + group._id);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).render('group-new', {
                title: NEW_TITLE,
                errors: Object.values(err.errors).map(e => e.message),
                values
            });
        }

        next(err);
    }
};

exports.show = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', {
            title: 'שגיאה',
            message: 'מזהה קבוצה לא תקין'
        });
    }

    try {
        const group = await Group.findById(req.params.id)
            .populate('creator', 'fullName username profileImage')
            .populate('members', 'fullName username profileImage');

        if (!group) return notFound(res);

        const posts = await Post.find({ group: group._id })
            .populate('author', 'fullName username profileImage')
            .sort({ createdAt: -1 })
            .limit(20);

        res.render('group', {
            title: group.name,
            group,
            posts,
            isManager: group.isManager(req.user._id),
            isMember: group.hasMember(req.user._id)
        });
    } catch (err) {
        next(err);
    }
};

exports.join = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה קבוצה לא תקין' });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'הקבוצה לא נמצאה' });
        }

        await Group.updateOne(
            { _id: group._id },
            { $addToSet: { members: req.user._id } }
        );

        const updated = await Group.findById(group._id).select('members');

        res.json({
            ok: true,
            isMember: true,
            memberCount: updated.members.length
        });
    } catch (err) {
        next(err);
    }
};

exports.leave = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה קבוצה לא תקין' });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'הקבוצה לא נמצאה' });
        }

        if (group.isManager(req.user._id)) {
            return res.status(400).json({
                error: 'מנהל הקבוצה לא יכול לעזוב אותה'
            });
        }

        await Group.updateOne(
            { _id: group._id },
            { $pull: { members: req.user._id } }
        );

        const updated = await Group.findById(group._id).select('members');

        res.json({
            ok: true,
            isMember: false,
            memberCount: updated.members.length
        });
    } catch (err) {
        next(err);
    }
};

exports.showEdit = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', {
            title: 'שגיאה',
            message: 'מזהה קבוצה לא תקין'
        });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) return notFound(res);

        if (!group.isManager(req.user._id)) {
            return res.status(403).render('error', {
                title: 'אין הרשאה',
                message: 'רק מנהל הקבוצה יכול לערוך אותה'
            });
        }

        res.render('group-edit', {
            title: 'עריכת ' + group.name,
            group,
            errors: [],
            values: {
                name: group.name,
                description: group.description,
                city: group.city
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', {
            title: 'שגיאה',
            message: 'מזהה קבוצה לא תקין'
        });
    }

    const { name, description, city } = req.body;

    try {
        const group = await Group.findById(req.params.id);

        if (!group) return notFound(res);

        if (!group.isManager(req.user._id)) {
            return res.status(403).render('error', {
                title: 'אין הרשאה',
                message: 'רק מנהל הקבוצה יכול לערוך אותה'
            });
        }

        if (req.uploadError) {
            return res.status(400).render('group-edit', {
                title: 'עריכת ' + group.name,
                group,
                errors: [req.uploadError],
                values: { name, description, city }
            });
        }

        group.name = name;
        group.description = description;
        group.city = city;

        if (req.file) {
            group.coverImage = '/uploads/' + req.file.filename;
        }

        await group.save();
        res.redirect('/groups/' + group._id);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).render('group-edit', {
                title: 'עריכת קבוצה',
                group: { _id: req.params.id },
                errors: Object.values(err.errors).map(e => e.message),
                values: { name, description, city }
            });
        }

        next(err);
    }
};

exports.destroy = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', {
            title: 'שגיאה',
            message: 'מזהה קבוצה לא תקין'
        });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) return notFound(res);

        if (!group.isManager(req.user._id)) {
            return res.status(403).render('error', {
                title: 'אין הרשאה',
                message: 'רק מנהל הקבוצה יכול למחוק אותה'
            });
        }

        await Post.updateMany(
            { group: group._id },
            { $set: { group: null } }
        );

        await Group.deleteOne({ _id: group._id });

        res.redirect('/groups');
    } catch (err) {
        next(err);
    }
};
