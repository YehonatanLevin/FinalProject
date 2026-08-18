const Post = require('../models/post');
const Group = require('../models/group');

const PAGE_SIZE = 10;

async function feedFilter(user) {
    const groups = await Group.find({ members: user._id }).select('_id');
    return {
        $or: [
            { author: user._id },
            { author: { $in: user.friends } },
            { group: { $in: groups.map(g => g._id) } }
        ]
    };
}

exports.index = async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    try {
        const filter = await feedFilter(req.user);

        const [posts, total] = await Promise.all([
            Post.find(filter)
                .populate('author', 'fullName username profileImage')
                .populate('group', 'name')
                .populate('run.route', 'name')
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE),
            Post.countDocuments(filter)
        ]);

        const activeGroups = await Group.find({ members: req.user._id })
            .select('name members')
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('feed', {
            title: 'הפיד',
            posts,
            activeGroups,
            page,
            pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            total
        });
    } catch (err) {
        next(err);
    }
};

exports.mine = async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const filter = { author: req.user._id };

    try {
        const [posts, total] = await Promise.all([
            Post.find(filter)
                .populate('author', 'fullName username profileImage')
                .populate('group', 'name')
                .populate('run.route', 'name')
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE),
            Post.countDocuments(filter)
        ]);

        res.render('my-posts', {
            title: 'הפוסטים שלי',
            posts,
            page,
            pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            total
        });
    } catch (err) {
        next(err);
    }
};
