/*
 * סקריפט מילוי נתוני דמו - דרישה 28.
 * הרצה:  node --env-file=.env scripts/seed.js
 */
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user');
const Group = require('../models/group');
const Route = require('../models/route');
const Post = require('../models/post');

const CITIES = ['תל אביב', 'נתניה', 'חיפה', 'ירושלים', 'רעננה', 'הרצליה', 'ראשון לציון', 'באר שבע'];
const FIRST = ['יונתן', 'דנה', 'רם', 'נועה', 'איתי', 'שירה', 'עומר', 'מאיה', 'גיא', 'תמר',
               'אורי', 'ליאור', 'רוני', 'אמיר', 'הילה', 'ניר', 'יעל', 'אסף', 'מיכל', 'דור',
               'שי', 'ענבר', 'טל', 'אלון', 'רותם'];
const LAST = ['לוי', 'כהן', 'מזרחי', 'פרץ', 'ביטון', 'אברהם', 'פרידמן', 'שפירא', 'אזולאי', 'גולן'];

const GROUP_NAMES = [
    'רצי הים', 'מועדון בוקר תל אביב', 'ריצות ערב נתניה', 'הכרמל טרייל',
    'מרתון ירושלים 2027', 'רצות ביחד', 'אולטרה נגב', 'ריצת פארק השרון'
];

const ROUTE_NAMES = [
    'טיילת חוף', 'פארק הירקון - הקפה', 'עליית הכרמל', 'שביל המעיינות',
    'סיבוב האגם', 'רכס הרים', 'טיילת הצוק', 'יער בן שמן',
    'פארק אריאל שרון', 'שדרות רוטשילד', 'נחל אלכסנדר', 'גבעת התיתורה',
    'חורשת האקליפטוס', 'מצפה הרים', 'שביל החולות', 'פארק הלאומי',
    'טבעת העיר', 'מסלול הפארק הגדול', 'דרך היין', 'רכס הצוקים'
];

const TEXTS = [
    'בוקר מעולה לריצה, אוויר צלול ורוח קלה מהים.',
    'סיימתי אימון אינטרוולים. הרגליים מרגישות את זה.',
    'ריצה קלה להתאוששות אחרי אתמול.',
    'מזג האוויר היה מושלם היום. ממליץ בחום על המסלול הזה.',
    'שיא אישי! לא האמנתי שאצליח לסיים בזמן הזה.',
    'ריצה משותפת עם הקבוצה. תמיד יותר קל כשרצים ביחד.',
    'החום היה קשה היום, הורדתי קצב וזה היה הדבר הנכון.',
    'ריצת ערב שקטה. בדיוק מה שהייתי צריך אחרי יום ארוך.',
    'עלייה מטורפת בקילומטר החמישי, אבל הנוף שווה הכל.',
    'מתחיל בניית בסיס לקראת המרתון. שבוע ראשון מאחורי.',
    'רצתי עם נעליים חדשות. הרגשה אחרת לגמרי.',
    'אימון טמפו. קצה של קצת מעל הנוח, בדיוק כמו בתוכנית.'
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(randInt(6, 21), randInt(0, 59), 0, 0);
    return d;
}

async function seed() {
    await connectDB();

    console.log('מנקה נתונים קיימים...');
    await Promise.all([
        Post.deleteMany({}), Route.deleteMany({}),
        Group.deleteMany({}), User.deleteMany({})
    ]);

    console.log('יוצר משתמשים...');
    const users = [];
    for (let i = 0; i < 25; i++) {
        const fullName = pick(FIRST) + ' ' + pick(LAST);
        const user = new User({
            username: 'runner' + (i + 1),
            password: 'secret1',
            fullName,
            email: 'runner' + (i + 1) + '@runtogether.test',
            city: pick(CITIES),
            bio: 'רץ/ה כבר ' + randInt(1, 12) + ' שנים.',
            monthlyGoalKm: randInt(30, 150)
        });
        await user.save();
        users.push(user);
    }

    console.log('מקשר חברויות...');
    for (const user of users) {
        const count = randInt(3, 8);
        const friends = new Set();
        while (friends.size < count) {
            const other = pick(users);
            if (!other._id.equals(user._id)) friends.add(String(other._id));
        }
        for (const id of friends) {
            await User.updateOne({ _id: user._id }, { $addToSet: { friends: id } });
            await User.updateOne({ _id: id }, { $addToSet: { friends: user._id } });
        }
    }

    console.log('יוצר קבוצות...');
    const groups = [];
    for (let i = 0; i < GROUP_NAMES.length; i++) {
        const creator = users[i % users.length];
        const members = new Set([String(creator._id)]);
        const target = randInt(5, 14);
        while (members.size < target) members.add(String(pick(users)._id));

        groups.push(await Group.create({
            name: GROUP_NAMES[i],
            description: 'קבוצת ריצה פעילה. מפגשים קבועים, כל הרמות מוזמנות.',
            city: pick(CITIES),
            creator: creator._id,
            members: Array.from(members)
        }));
    }

    console.log('יוצר מסלולים...');
    const routes = [];
    for (let i = 0; i < ROUTE_NAMES.length; i++) {
        routes.push(await Route.create({
            name: ROUTE_NAMES[i],
            description: 'מסלול מסומן, מתאים לריצות ' + pick(['בוקר', 'ערב', 'סוף שבוע']) + '.',
            address: 'רחוב ' + randInt(1, 90) + ', ' + pick(CITIES),
            lat: rand(31.2, 33.0),
            lng: rand(34.7, 35.6),
            distanceKm: Math.round(rand(3, 25) * 10) / 10,
            difficulty: pick(['easy', 'medium', 'hard']),
            city: pick(CITIES),
            createdBy: pick(users)._id
        }));
    }

    console.log('יוצר פוסטים...');
    const posts = [];
    for (let i = 0; i < 150; i++) {
        const author = pick(users);
        const roll = Math.random();
        const type = roll < 0.55 ? 'run' : (roll < 0.75 ? 'image' : 'text');
        const inGroup = Math.random() < 0.6;

        const post = new Post({
            author: author._id,
            type: type === 'image' ? 'text' : type,
            content: pick(TEXTS),
            group: inGroup ? pick(groups)._id : null,
            createdAt: daysAgo(randInt(0, 150))
        });

        if (type === 'run') {
            const route = pick(routes);
            const distance = Math.round(rand(3, Math.max(4, route.distanceKm)) * 10) / 10;
            post.run = {
                distanceKm: distance,
                durationMin: Math.round(distance * rand(4.5, 7)),
                route: route._id
            };
        }

        await post.save();
        await Post.updateOne({ _id: post._id }, { $set: { createdAt: post.createdAt } });
        posts.push(post);
    }

    console.log('מוסיף לייקים ותגובות...');
    for (const post of posts) {
        const likers = new Set();
        const likeCount = randInt(0, 9);
        while (likers.size < likeCount) likers.add(String(pick(users)._id));

        const comments = [];
        const commentCount = randInt(0, 3);
        for (let i = 0; i < commentCount; i++) {
            comments.push({
                author: pick(users)._id,
                text: pick(['כל הכבוד!', 'מסלול מעולה', 'איזה קצב', 'מצטרף בפעם הבאה',
                            'תותח', 'ריצה יפה', 'איפה זה בדיוק?']),
                createdAt: new Date(post.createdAt.getTime() + randInt(1, 48) * 3600000)
            });
        }

        await Post.updateOne({ _id: post._id },
            { $set: { likes: Array.from(likers), comments } });
    }

    const counts = {
        משתמשים: await User.countDocuments(),
        קבוצות: await Group.countDocuments(),
        מסלולים: await Route.countDocuments(),
        פוסטים: await Post.countDocuments()
    };

    console.log('\nהושלם:', counts);
    console.log('סיסמה לכל המשתמשים: secret1  (למשל runner1 / secret1)\n');

    await mongoose.connection.close();
}

seed().catch(err => {
    console.error('שגיאה בהרצת ה-seed:', err);
    process.exit(1);
});