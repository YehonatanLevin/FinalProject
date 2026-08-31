# RunTogether

רשת חברתית לרצים. פרויקט גמר בקורס פיתוח אפליקציות אינטרנטיות.

משתמשים מדווחים על ריצות, מצטרפים לקבוצות ריצה, שומרים מסלולים על מפה
ורואים סטטיסטיקות מצטברות של הקבוצה ושל עצמם.

## דרישות מוקדמות

- Node.js 20 ומעלה
- MongoDB - מקומי או Atlas
- Git

## התקנה

```bash
git clone https://github.com/YehonatanLevin/FinalProject.git
cd FinalProject
npm install
```

## הגדרות

העתיקו את `.env.example` לקובץ `.env` ומלאו ערכים אמיתיים:

```bash
cp .env.example .env
```

| משתנה | תיאור |
|---|---|
| `MONGODB_URI` | מחרוזת החיבור ל-MongoDB |
| `PORT` | פורט השרת (ברירת מחדל 3000) |
| `MAPS_API_KEY` | מפתח Google Maps (Maps Demo Key, חינמי) |
| `SESSION_SECRET` | מחרוזת אקראית לחתימת ה-session |
| `FB_PAGE_ID` | מזהה עמוד הפייסבוק שאליו מפרסמים |
| `FB_ACCESS_TOKEN` | Page Access Token מ-Graph API |

הקובץ `.env` נמצא ב-`.gitignore` ואינו נכנס לגיט.

`MONGODB_URI` ו-`SESSION_SECRET` הם שדות חובה. בלי `SESSION_SECRET`
השרת עולה עם מחרוזת ברירת מחדל, וזה מתאים לפיתוח בלבד.

כל עוד `FB_PAGE_ID` ו-`FB_ACCESS_TOKEN` ריקים, שיתוף לפייסבוק מחזיר 503
עם הודעה ברורה, ושאר האפליקציה עובדת כרגיל.

## הרצה

```bash
npm start
```

השרת יעלה בכתובת http://localhost:3000

## נתוני דמו

```bash
node --env-file=.env scripts/seed.js
```

הסקריפט מייצר משתמשים, קבוצות, מסלולים ופוסטים לאורך מספר חודשים,
כדי שהגרפים והסטטיסטיקות יציגו נתונים אמיתיים.

## בדיקת מקרי קצה

כשהשרת פועל, בחלון PowerShell נפרד:

```powershell
.\scripts\check-edge-cases.ps1
```

הסקריפט בודק דפים ציבוריים, הגנה על דפים מוגנים, ולידציה של טופס ההרשמה
והתחברות עם פרטים שגויים.

## מבנה הפרויקט

```
FinalProject/
  app.js         נקודת הכניסה
  config/        חיבור למסד, session, העלאת קבצים, Facebook API
  controllers/   לוגיקת הבקשות
  middleware/    הרשאות, משתמש נוכחי, טיפול בשגיאות
  models/        סכמות Mongoose
  routes/        מיפוי כתובות לבקרים
  scripts/       seed ובדיקות
  utils/         פונקציות עזר
  public/        CSS, JS, פונטים, תמונות
  views/         תבניות EJS
```

## שיתוף לפייסבוק

השיתוף מבוצע מול Facebook Graph API v25 מצד השרת: הבקשה יוצאת מ-`config/facebook.js`,
הפוסט נוצר בעמוד, ואז נשלפים פרטיו כדי להציג למשתמש מזהה וקישור.
אין שימוש ב-iframe, בכפתור Like מוכן או בהתחברות דרך פייסבוק.

## טכנולוגיות

צד שרת: Node.js, Express, Mongoose, express-session, bcryptjs, multer

מסד נתונים: MongoDB

תבניות: EJS

צד לקוח: HTML5, CSS3, Bootstrap 5, jQuery, AJAX, D3.js

ארכיטקטורה: MVC

## חלוקת אחריות

| | תחום |
|---|---|
| A | משתמשים, הרשאות, עיצוב, טיפול בשגיאות, פייסבוק |
| B | פוסטים, קבוצות, פיד, חיפוש |
| C | מסלולים, מפה, נתונים, גרפים |
