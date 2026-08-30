const mongoose = require('mongoose');
const Post = require('../models/post');
const facebook = require('../config/facebook');

function buildMessage(post) {
    const author = post.author.fullName;

    if (post.type === 'run' && post.run && post.run.distanceKm) {
        const parts = [author + ' רץ ' + post.run.distanceKm + ' ק"מ'];
        if (post.run.durationMin) {
            parts.push('ב-' + post.run.durationMin + ' דקות');
        }
        if (post.run.route && post.run.route.name) {
            parts.push('במסלול ' + post.run.route.name);
        }
        return parts.join(' ') + '.\n\n' + post.content + '\n\n#RunTogether';
    }

    return author + ' ב-RunTogether:\n\n' + post.content + '\n\n#RunTogether';
}

exports.toFacebook = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה פוסט לא תקין' });
    }

    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'fullName')
            .populate('run.route', 'name');

        if (!post) return res.status(404).json({ error: 'הפוסט לא נמצא' });
        if (!post.isAuthor(req.user._id)) {
            return res.status(403).json({ error: 'ניתן לשתף רק פוסטים שכתבת' });
        }

        if (!facebook.isConfigured()) {
            return res.status(503).json({
                error: 'שיתוף לפייסבוק לא מוגדר. חסרים FB_PAGE_ID או FB_ACCESS_TOKEN בקובץ .env'
            });
        }

        const message = buildMessage(post);
        const created = await facebook.publish(message);
        const details = await facebook.fetchPost(created.id);

        res.json({
            ok: true,
            facebookId: details.id,
            message: details.message,
            createdTime: details.created_time,
            permalink: details.permalink_url
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            return res.status(504).json({ error: 'פייסבוק לא הגיב בזמן' });
        }
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        next(err);
    }
};