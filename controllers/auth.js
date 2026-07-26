const User = require('../models/user');

const FORM_TITLE = 'הרשמה';

exports.showRegister = (req, res) => {
    res.render('register', { title: FORM_TITLE, errors: [], values: {} });
};

exports.register = async (req, res, next) => {
    const { username, fullName, email, city, password, passwordConfirm } = req.body;
    const values = { username, fullName, email, city };

    if (password !== passwordConfirm) {
        return res.status(400).render('register', {
            title: FORM_TITLE,
            errors: ['הסיסמאות אינן תואמות'],
            values
        });
    }

    try {
        const user = await User.create({ username, fullName, email, city, password });
        req.session.userId = user._id;
        res.redirect('/');
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).render('register', {
                title: FORM_TITLE,
                errors: Object.values(err.errors).map(e => e.message),
                values
            });
        }
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).render('register', {
                title: FORM_TITLE,
                errors: [field === 'username' ? 'שם המשתמש כבר תפוס' : 'כתובת האימייל כבר רשומה'],
                values
            });
        }
        next(err);
    }
};
const LOGIN_TITLE = 'התחברות';

exports.showLogin = (req, res) => {
    res.render('login', { title: LOGIN_TITLE, error: null, values: {} });
};

exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: (username || '').trim().toLowerCase() });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).render('login', {
                title: LOGIN_TITLE,
                error: 'שם משתמש או סיסמה שגויים',
                values: { username }
            });
        }

        req.session.userId = user._id;
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};