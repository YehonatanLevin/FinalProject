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
        await User.create({ username, fullName, email, city, password });
        res.redirect('/login');
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