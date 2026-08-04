const mongoose = require('mongoose');
const User = require('../models/user');

const EDIT_TITLE = 'עריכת פרופיל';

function renderProfile(res, viewer, profileUser, title) {
    const isOwn = profileUser._id.equals(viewer._id);
    const isFriend = viewer.friends.some(f => f.equals(profileUser._id));
    res.render('profile', { title, profileUser, isOwn, isFriend });
}

exports.profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username fullName profileImage');
        renderProfile(res, req.user, user, 'הפרופיל שלי');
    } catch (err) {
        next(err);
    }
};

exports.showUser = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).render('error', { title: 'שגיאה', message: 'מזהה משתמש לא תקין' });
    }
    try {
        const user = await User.findById(req.params.id)
            .populate('friends', 'username fullName profileImage');
        if (!user) {
            return res.status(404).render('error', { title: 'לא נמצא', message: 'המשתמש לא נמצא' });
        }
        renderProfile(res, req.user, user, user.fullName);
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('username fullName city profileImage')
            .sort({ fullName: 1 })
            .limit(50);
        res.render('users', { title: 'משתמשים', users, friendIds: req.user.friends.map(String) });
    } catch (err) {
        next(err);
    }
};

exports.addFriend = async (req, res, next) => {
    const targetId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ error: 'מזהה משתמש לא תקין' });
    }
    if (targetId === String(req.user._id)) {
        return res.status(400).json({ error: 'לא ניתן להוסיף את עצמך כחבר' });
    }

    try {
        const target = await User.findById(targetId);
        if (!target) {
            return res.status(404).json({ error: 'המשתמש לא נמצא' });
        }

        await User.updateOne({ _id: req.user._id }, { $addToSet: { friends: target._id } });
        await User.updateOne({ _id: target._id }, { $addToSet: { friends: req.user._id } });

        res.json({ ok: true, isFriend: true });
    } catch (err) {
        next(err);
    }
};

exports.removeFriend = async (req, res, next) => {
    const targetId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ error: 'מזהה משתמש לא תקין' });
    }

    try {
        await User.updateOne({ _id: req.user._id }, { $pull: { friends: targetId } });
        await User.updateOne({ _id: targetId }, { $pull: { friends: req.user._id } });

        res.json({ ok: true, isFriend: false });
    } catch (err) {
        next(err);
    }
};

exports.showEdit = (req, res) => {
    res.render('profile-edit', {
        title: EDIT_TITLE,
        errors: [],
        values: {
            fullName: req.user.fullName,
            city: req.user.city,
            bio: req.user.bio,
            monthlyGoalKm: req.user.monthlyGoalKm
        },
        profileImage: req.user.profileImage
    });
};

exports.update = async (req, res, next) => {
    const { fullName, city, bio, monthlyGoalKm } = req.body;
    const values = { fullName, city, bio, monthlyGoalKm };

    const rerender = (errors) => res.status(400).render('profile-edit', {
        title: EDIT_TITLE,
        errors: errors,
        values: values,
        profileImage: req.user.profileImage
    });

    if (req.uploadError) {
        return rerender([req.uploadError]);
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.redirect('/login');
        }

        user.fullName = fullName;
        user.city = city;
        user.bio = bio;
        user.monthlyGoalKm = monthlyGoalKm === '' ? 0 : monthlyGoalKm;

        if (req.file) {
            user.profileImage = '/uploads/' + req.file.filename;
        }

        await user.save();
        res.redirect('/profile');
    } catch (err) {
        if (err.name === 'ValidationError') {
            return rerender(Object.values(err.errors).map(e => e.message));
        }
        next(err);
    }
};