/*
 * ממשק ל-Facebook Graph API - דרישה 33.iv.
 * הקריאה יוצאת מהשרת שלנו אל ה-API ומטפלת בתשובה.
 * לא iframe, לא כפתור Like מוכן, ולא התחברות דרך פייסבוק.
 */
const GRAPH_VERSION = 'v25.0';
const GRAPH_BASE = 'https://graph.facebook.com/' + GRAPH_VERSION;
const TIMEOUT_MS = 8000;

function isConfigured() {
    return Boolean(process.env.FB_PAGE_ID && process.env.FB_ACCESS_TOKEN);
}

async function callGraph(path, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(GRAPH_BASE + path, {
            ...options,
            signal: controller.signal
        });
        const data = await response.json();

        if (!response.ok) {
            const message = (data.error && data.error.message) || 'שגיאה מ-Facebook';
            const err = new Error(message);
            err.status = response.status === 400 ? 400 : 502;
            throw err;
        }
        return data;
    } finally {
        clearTimeout(timer);
    }
}

/* שידור: פרסום דיווח ריצה כפוסט בעמוד */
async function publish(message, link) {
    const body = new URLSearchParams({
        message,
        access_token: process.env.FB_ACCESS_TOKEN
    });
    if (link) body.set('link', link);

    return callGraph('/' + process.env.FB_PAGE_ID + '/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
}

/* קבלה: שליפת הפוסט שנוצר, כדי להציג נתונים שחזרו מה-API */
async function fetchPost(postId) {
    const query = new URLSearchParams({
        fields: 'id,message,created_time,permalink_url',
        access_token: process.env.FB_ACCESS_TOKEN
    });
    return callGraph('/' + postId + '?' + query.toString(), { method: 'GET' });
}

module.exports = { isConfigured, publish, fetchPost, GRAPH_VERSION };