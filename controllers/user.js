const User = require('../models/user');

exports.profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friends', 'username fullName profileImage');
        res.render('profile', { title: 'הפרופיל שלי', profileUser: user });
    } catch (err) {
        next(err);
    }
};