const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'שם המסלול הוא שדה חובה'],
        trim: true,
        minlength: [2, 'שם המסלול קצר מדי'],
        maxlength: [80, 'שם המסלול ארוך מדי']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'התיאור לא יכול להכיל יותר מ-500 תווים'],
        default: ''
    },
    address: {
        type: String,
        required: [true, 'כתובת נקודת ההתחלה היא שדה חובה'],
        trim: true,
        maxlength: [200, 'הכתובת ארוכה מדי']
    },
    lat: {
        type: Number,
        required: [true, 'קו רוחב הוא שדה חובה'],
        min: [-90, 'קו רוחב לא תקין'],
        max: [90, 'קו רוחב לא תקין']
    },
    lng: {
        type: Number,
        required: [true, 'קו אורך הוא שדה חובה'],
        min: [-180, 'קו אורך לא תקין'],
        max: [180, 'קו אורך לא תקין']
    },
    distanceKm: {
        type: Number,
        required: [true, 'אורך המסלול הוא שדה חובה'],
        min: [0.1, 'אורך המסלול חייב להיות גדול מ-0'],
        max: [500, 'אורך המסלול גדול מדי']
    },
    difficulty: {
        type: String,
        required: [true, 'רמת הקושי היא שדה חובה'],
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'רמת קושי לא תקינה'
        }
    },
    city: {
        type: String,
        trim: true,
        maxlength: [40, 'שם העיר ארוך מדי'],
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

/* אינדקסים - דרישה C13 */
routeSchema.index({ city: 1, distanceKm: 1, difficulty: 1 });
routeSchema.index({ createdBy: 1 });
routeSchema.index({ name: 1 });

module.exports = mongoose.model('Route', routeSchema);