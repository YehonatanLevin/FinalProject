const User = require('../models/user');

module.exports = async function currentUser(req, res, next) {
    res.locals.currentUser = null;
    req.user = null;

    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).select('-password');
            if (user) {
                req.user = user;
                res.locals.currentUser = user;
            } else {
                req.session.destroy(() => {});
            }
        } catch (err) {
            return next(err);
        }
    }
    next();
};