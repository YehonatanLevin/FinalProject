const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'שם הקבוצה הוא שדה חובה'],
        trim: true,
        minlength: [2, 'שם הקבוצה קצר מדי'],
        maxlength: [50, 'שם הקבוצה ארוך מדי']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'התיאור לא יכול להכיל יותר מ-500 תווים'],
        default: ''
    },
    city: {
        type: String,
        trim: true,
        maxlength: [40, 'שם העיר ארוך מדי'],
        default: ''
    },
    coverImage: {
        type: String,
        default: '/images/default-group.png'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

groupSchema.methods.isManager = function (userId) {
    return this.creator.equals(userId);
};

groupSchema.methods.hasMember = function (userId) {
    return this.members.some(m => m.equals(userId));
};

/* אינדקסים - דרישה C13 */
groupSchema.index({ city: 1 });
groupSchema.index({ members: 1 });
groupSchema.index({ creator: 1 });

module.exports = mongoose.model('Group', groupSchema);