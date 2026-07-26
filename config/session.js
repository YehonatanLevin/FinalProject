const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/runtogether';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';

module.exports = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
});