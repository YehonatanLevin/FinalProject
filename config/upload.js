const multer = require('multer');
const path = require('path');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
    }
});

function fileFilter(req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
        req.uploadError = 'ניתן להעלות תמונות מסוג JPG, PNG או WEBP בלבד';
        return cb(null, false);
    }
    cb(null, true);
}

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});