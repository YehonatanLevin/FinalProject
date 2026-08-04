const User = require('../models/user');

const EDIT_TITLE = 'עריכת פרופיל';

exports.profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username fullName profileImage');
        res.render('profile', { title: 'הפרופיל שלי', profileUser: user });
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