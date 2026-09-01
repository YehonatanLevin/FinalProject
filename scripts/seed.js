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

/* עיר ותיאור לכל קבוצה, לפי הסדר של GROUP_NAMES */
const GROUP_CITIES = [
    'תל אביב', 'תל אביב', 'נתניה', 'חיפה',
    'ירושלים', 'רעננה', 'באר שבע', 'הרצליה'
];

const GROUP_DESCRIPTIONS = [
    'ריצות בוקר על קו החוף, שישי בשש. אחרי הריצה קפה בטיילת.',
    'מפגש כל שני וחמישי ב-5:45 בגני יהושע. אימוני טמפו ואינטרוולים לסירוגין.',
    'יוצאים בערב מטיילת ניצה. קצב נוח, אף אחד לא נשאר מאחור.',
    'טרייל בשבילי הכרמל. עליות, נוף, ונעליים שחוזרות מלוכלכות.',
    'מתאמנים יחד לקראת מרתון ירושלים. תוכנית של 16 שבועות, ריצה ארוכה בשבת.',
    'קבוצת נשים, כל הרמות. הדגש על עקביות ולא על שעון.',
    'ריצות מרחק בנגב, לפני הזריחה. לוקחים מים להכל.',
    'הקפות בפארק, ראשון ורביעי. מתאים גם למי שחוזר מפציעה.'
];

/*
 * מקומות ריצה אמיתיים. הכתובת, העיר והנקודה על המפה שייכים לאותו מקום,
 * כדי שסימון על המפה יתאים למה שכתוב בכרטיס המסלול.
 * הקואורדינטות נלקחו מ-OpenStreetMap.
 */
const LOCATIONS = [
    { name: 'פארק הירקון - הקפת האגם', address: 'גני יהושע, תל אביב', city: 'תל אביב', lat: 32.10303, lng: 34.81673 },
    { name: 'טיילת תל אביב - צפון לדרום', address: 'מגדלי טיילת דוד 1, תל אביב', city: 'תל אביב', lat: 32.07504, lng: 34.76593 },
    { name: 'שדרות רוטשילד', address: 'שדרות רוטשילד, תל אביב', city: 'תל אביב', lat: 32.06779, lng: 34.77805 },
    { name: 'פארק הלאומי רמת גן', address: 'הפארק הלאומי, רמת גן', city: 'רמת גן', lat: 32.04956, lng: 34.82553 },
    { name: 'פארק אריאל שרון', address: 'פארק אריאל שרון, תל אביב', city: 'תל אביב', lat: 32.03053, lng: 34.82063 },
    { name: 'טיילת ראשון לציון', address: 'חוף ראשון לציון, ראשון לציון', city: 'ראשון לציון', lat: 32.00137, lng: 34.73272 },
    { name: 'טיילת ניצה', address: 'טיילת ניצה, נתניה', city: 'נתניה', lat: 32.34082, lng: 34.85275 },
    { name: 'פארק עירוני נתניה', address: 'פארק האירוסים, נתניה', city: 'נתניה', lat: 32.28337, lng: 34.83975 },
    { name: 'טיילת לואי - הכרמל', address: 'טיילת לואי, חיפה', city: 'חיפה', lat: 32.81049, lng: 34.98564 },
    { name: 'חוף בת גלים', address: 'בת גלים, חיפה', city: 'חיפה', lat: 32.83299, lng: 34.97933 },
    { name: 'פארק סאקר', address: 'גן סאקר, ירושלים', city: 'ירושלים', lat: 31.77987, lng: 35.20758 },
    { name: 'יער ירושלים', address: 'יער ירושלים, ירושלים', city: 'ירושלים', lat: 31.7821, lng: 35.18609 },
    { name: 'פארק רעננה', address: 'פארק רעננה, רעננה', city: 'רעננה', lat: 32.18868, lng: 34.84729 },
    { name: 'חוף אכדיה', address: 'חוף אכדיה, הרצליה', city: 'הרצליה', lat: 32.16815, lng: 34.79843 },
    { name: 'פארק הרצליה', address: 'פארק הרצליה, הרצליה', city: 'הרצליה', lat: 32.16814, lng: 34.8226 },
    { name: 'נחל אלכסנדר', address: 'נחל אלכסנדר, נתניה', city: 'נתניה', lat: 32.37029, lng: 34.91014 },
    { name: 'פארק נחל באר שבע', address: 'פארק נחל באר שבע, באר שבע', city: 'באר שבע', lat: 31.23731, lng: 34.82104 },
    { name: 'יער בן שמן', address: 'יער בן-שמן, מודיעין', city: 'מודיעין', lat: 31.93595, lng: 34.9598 },
    { name: 'גבעת התיתורה', address: 'גבעת התיתורה, מודיעין', city: 'מודיעין', lat: 31.90264, lng: 35.0206 },
    { name: 'טיילת אשדוד', address: 'הטיילת/סמטת אל הים, אשדוד', city: 'אשדוד', lat: 31.81347, lng: 34.64158 }
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

/* תמונות לפוסטים מסוג image. קבצים שקיימים ב-public/images ונמצאים בגיט. */
const POST_IMAGES = [
    '/images/posts/sunrise-run.png',
    '/images/posts/park-trail.png',
    '/images/posts/coastal-run.png',
    '/images/posts/evening-run.png'
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
/* תאריך אקראי בתוך החודש הקלנדרי הנוכחי */
function dayThisMonth() {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), randInt(1, now.getDate()));
    d.setHours(randInt(6, 21), randInt(0, 59), 0, 0);
    return d > now ? now : d;
}

/* שלוש ריצות בחודש הנוכחי ושתיים אחורה, בתוך חלון שמונת השבועות */
function runDates() {
    return [
        dayThisMonth(),
        dayThisMonth(),
        dayThisMonth(),
        daysAgo(randInt(13, 30)),
        daysAgo(randInt(31, 52))
    ];
}

/*
 * תאריך מוטה לתקופה האחרונה.
 * 60% מהפוסטים ב-55 הימים האחרונים, כדי שגרף הקו וטבעת ההתקדמות
 * לא ייראו ריקים, והשאר מפוזרים עד 150 יום אחורה - דרישה 28.
 */
function recentDate() {
    return Math.random() < 0.6 ? daysAgo(randInt(0, 55)) : daysAgo(randInt(56, 150));
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
            description: GROUP_DESCRIPTIONS[i],
            city: GROUP_CITIES[i],
            creator: creator._id,
            members: Array.from(members)
        }));
    }

    console.log('יוצר מסלולים...');
    const routes = [];
    for (let i = 0; i < LOCATIONS.length; i++) {
        const spot = LOCATIONS[i];
        routes.push(await Route.create({
            name: spot.name,
            description: 'מסלול מסומן, מתאים לריצות ' + pick(['בוקר', 'ערב', 'סוף שבוע']) + '.',
            address: spot.address,
            lat: spot.lat,
            lng: spot.lng,
            distanceKm: Math.round(rand(3, 25) * 10) / 10,
            difficulty: pick(['easy', 'medium', 'hard']),
            city: spot.city,
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
            type: type,
            content: pick(TEXTS),
            group: inGroup ? pick(groups)._id : null,
            createdAt: recentDate()
        });

        if (type === 'image') {
            post.image = pick(POST_IMAGES);
        }

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

    /*
     * דיווחי ריצה מובטחים: לכל משתמש שלוש ריצות בחודש הנוכחי
     * ובתוך חלון 8 השבועות. בלי זה, חלק מהמשתמשים נכנסים לדף
     * הסטטיסטיקה וגרף הקו וטבעת ההתקדמות מוצגים ריקים.
     */
    console.log('מוסיף דיווחי ריצה אחרונים לכל משתמש...');
    for (const user of users) {
        const myGroups = groups.filter(g => g.members.some(m => m.equals(user._id)));

        for (const when of runDates()) {
            const route = pick(routes);
            const distance = Math.round(rand(4, 14) * 10) / 10;

            const post = new Post({
                author: user._id,
                type: 'run',
                content: pick(TEXTS),
                group: myGroups.length ? pick(myGroups)._id : null,
                run: {
                    distanceKm: distance,
                    durationMin: Math.round(distance * rand(4.5, 7)),
                    route: route._id
                },
                createdAt: when
            });

            await post.save();
            await Post.updateOne({ _id: post._id }, { $set: { createdAt: when } });
            posts.push(post);
        }
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
                createdAt: new Date(Math.min(
                    Date.now() - randInt(1, 90) * 60000,
                    post.createdAt.getTime() + randInt(1, 48) * 3600000
                ))
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