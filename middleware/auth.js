function wantsJson(req) {
    return req.xhr || (req.get('Accept') || '').indexOf('application/json') !== -1;
}

exports.requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: 'עליך להתחבר כדי לבצע פעולה זו' });
        }
        return res.redirect('/login');
    }
    next();
};

exports.requireGuest = (req, res, next) => {
    if (req.session.userId) {
        if (wantsJson(req)) {
            return res.status(403).json({ error: 'אתה כבר מחובר' });
        }
        return res.redirect('/');
    }
    next();
};