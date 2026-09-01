const mongoose = require('mongoose');
const User = require('../models/user');
const Group = require('../models/group');
const Post = require('../models/post');
const escapeRegex = require('../utils/escapeRegex');

const EDIT_TITLE = 'עריכת פרופיל';

const PROFILE_POSTS = 5;

async function renderProfile(res, viewer, profileUser, title) {
    const isOwn = profileUser._id.equals(viewer._id);
    const isFriend = viewer.friends.some(f => f.equals(profileUser._id));

    const filter = { author: profileUser._id };
    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate('author', 'fullName username profileImage')
            .populate('group', 'name')
            .populate('run.route', 'name')
            .populate('comments.author', 'fullName profileImage')
            .sort({ createdAt: -1 })
            .limit(PROFILE_POSTS),
        Post.countDocuments(filter)
    ]);

    res.render('profile', { title, profileUser, isOwn, isFriend, posts, total });
}

exports.profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username fullName profileImage');
        await renderProfile(res, req.user, user, 'הפרופיל שלי');
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
        await renderProfile(res, req.user, user, user.fullName);
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    const q = (req.query.q || '').trim();
    const city = (req.query.city || '').trim();

    const filter = { _id: { $ne: req.user._id } };

    if (q) {
        const rx = new RegExp(escapeRegex(q), 'i');
        filter.$or = [{ username: rx }, { fullName: rx }];
    }
    if (city) {
        filter.city = new RegExp(escapeRegex(city), 'i');
    }

    try {
        const users = await User.find(filter)
            .select('username fullName city profileImage')
            .sort({ fullName: 1 })
            .limit(50);

        const payload = {
            title: 'משתמשים',
            users,
            friendIds: req.user.friends.map(String),
            values: { q, city }
        };

        if (req.xhr) {
            return res.json({ users, friendIds: payload.friendIds });
        }
        res.render('users', payload);
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

exports.destroy = async (req, res, next) => {
    const userId = req.user._id;

    try {
        await User.updateMany({ friends: userId }, { $pull: { friends: userId } });
        await Group.updateMany({ members: userId }, { $pull: { members: userId } });

        /*
         * הקבוצות שהמשתמש יצר נמחקות איתו. קודם מנתקים מהן פוסטים של
         * משתמשים אחרים, אחרת הם נשארים עם הפניה לקבוצה שכבר לא קיימת.
         * אותה התנהגות כמו במחיקת קבוצה ב-controllers/group.js.
         */
        const ownedGroups = await Group.find({ creator: userId }).select('_id');
        await Post.updateMany(
            { group: { $in: ownedGroups.map(g => g._id) } },
            { $set: { group: null } }
        );
        await Group.deleteMany({ creator: userId });
        await Post.deleteMany({ author: userId });
        await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
        await Post.updateMany({}, { $pull: { comments: { author: userId } } });
        await User.deleteOne({ _id: userId });

        req.session.destroy(() => {
            res.redirect('/');
        });
    } catch (err) {
        next(err);
    }
};