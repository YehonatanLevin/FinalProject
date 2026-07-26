exports.requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

exports.requireGuest = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    next();
};