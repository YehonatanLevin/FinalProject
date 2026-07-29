const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'לא ניתן לשלוח תגובה ריקה'],
        trim: true,
        maxlength: [300, 'התגובה לא יכולה להכיל יותר מ-300 תווים']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: {
            values: ['text', 'image', 'run'],
            message: 'סוג פוסט לא תקין'
        },
        default: 'text'
    },
    content: {
        type: String,
        required: [true, 'לא ניתן לפרסם פוסט ריק'],
        trim: true,
        maxlength: [1000, 'הפוסט לא יכול להכיל יותר מ-1000 תווים']
    },
    image: {
        type: String,
        default: '',
        required: [
            function () { return this.type === 'image'; },
            'פוסט מסוג תמונה חייב לכלול תמונה'
        ]
    },
    run: {
        distanceKm: {
            type: Number,
            required: [
                function () { return this.type === 'run'; },
                'דיווח ריצה חייב לכלול מרחק'
            ],
            min: [0.1, 'המרחק חייב להיות גדול מ-0'],
            max: [500, 'המרחק גדול מדי']
        },
        durationMin: {
            type: Number,
            min: [1, 'משך הריצה חייב להיות לפחות דקה'],
            max: [1440, 'משך הריצה גדול מדי']
        },
        route: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Route'
        }
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema]
}, {
    timestamps: true
});

postSchema.methods.isAuthor = function (userId) {
    return this.author._id
        ? this.author._id.equals(userId)
        : this.author.equals(userId);
};

postSchema.methods.isLikedBy = function (userId) {
    return this.likes.some(id => id.equals(userId));
};

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);