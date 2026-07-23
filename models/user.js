const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'שם משתמש הוא שדה חובה'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'שם משתמש חייב להכיל לפחות 3 תווים'],
        maxlength: [20, 'שם משתמש לא יכול להכיל יותר מ-20 תווים'],
        match: [/^[a-z0-9_]+$/, 'שם משתמש יכול להכיל אותיות באנגלית, ספרות וקו תחתון בלבד']
    },
    password: {
        type: String,
        required: [true, 'סיסמה היא שדה חובה'],
        minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים']
    },
    fullName: {
        type: String,
        required: [true, 'שם מלא הוא שדה חובה'],
        trim: true,
        minlength: [2, 'שם מלא קצר מדי'],
        maxlength: [60, 'שם מלא ארוך מדי']
    },    email: {
        type: String,
        required: [true, 'כתובת אימייל היא שדה חובה'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'כתובת האימייל אינה תקינה']
    },
    city: {
        type: String,
        trim: true,
        maxlength: [40, 'שם העיר ארוך מדי'],
        default: ''
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [200, 'התיאור לא יכול להכיל יותר מ-200 תווים'],
        default: ''
    },    profileImage: {
        type: String,
        default: '/images/default-avatar.png'
    },
    monthlyGoalKm: {
        type: Number,
        min: [0, 'היעד לא יכול להיות שלילי'],
        max: [1000, 'היעד גבוה מדי'],
        default: 50
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);