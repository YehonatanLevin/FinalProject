const mongoose = require('mongoose');
const Post = require('../models/post');

exports.toggleLike = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה פוסט לא תקין' });
    }

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'הפוסט לא נמצא' });
        }

        const liked = post.isLikedBy(req.user._id);

        const update = liked
            ? { $pull: { likes: req.user._id } }
            : { $addToSet: { likes: req.user._id } };

        await Post.updateOne({ _id: post._id }, update);

        const updated = await Post.findById(post._id).select('likes');

        res.json({
            ok: true,
            liked: !liked,
            likeCount: updated.likes.length
        });

    } catch (err) {
        next(err);
    }
};


exports.addComment = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה פוסט לא תקין' });
    }

    const text = (req.body.text || '').trim();

    if (!text) {
        return res.status(400).json({ error: 'לא ניתן לשלוח תגובה ריקה' });
    }

    if (text.length > 300) {
        return res.status(400).json({
            error: 'התגובה לא יכולה להכיל יותר מ-300 תווים'
        });
    }

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'הפוסט לא נמצא' });
        }

        post.comments.push({
            author: req.user._id,
            text
        });

        await post.save();

        const comment = post.comments[post.comments.length - 1];

        res.status(201).json({
            ok: true,
            commentCount: post.comments.length,
            comment: {
                _id: comment._id,
                text: comment.text,
                createdAt: comment.createdAt,
                author: {
                    _id: req.user._id,
                    fullName: req.user.fullName,
                    profileImage: req.user.profileImage
                }
            }
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: Object.values(err.errors)[0].message
            });
        }

        next(err);
    }
};


exports.deleteComment = async (req, res, next) => {
    const { id, commentId } = req.params;

    if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(commentId)
    ) {
        return res.status(400).json({ error: 'מזהה לא תקין' });
    }

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ error: 'הפוסט לא נמצא' });
        }

        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'התגובה לא נמצאה' });
        }

        const isCommentAuthor = comment.author.equals(req.user._id);
        const isPostAuthor = post.isAuthor(req.user._id);

        if (!isCommentAuthor && !isPostAuthor) {
            return res.status(403).json({
                error: 'אין לך הרשאה למחוק את התגובה'
            });
        }

        comment.deleteOne();
        await post.save();

        res.json({
            ok: true,
            commentCount: post.comments.length
        });

    } catch (err) {
        next(err);
    }
};
