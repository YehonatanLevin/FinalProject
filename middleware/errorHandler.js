const STATUS_BY_NAME = {
    ValidationError: 400,
    CastError: 400,
    MulterError: 400
};

exports.notFound = (req, res) => {
    if (req.xhr) {
        return res.status(404).json({ error: 'הכתובת המבוקשת לא נמצאה' });
    }
    res.status(404).render('404', { title: 'הדף לא נמצא' });
};

exports.errorHandler = (err, req, res, next) => {
    const status = err.status || STATUS_BY_NAME[err.name] || 500;

    console.error(`[${status}] ${req.method} ${req.originalUrl} - ${err.message}`);

    const message = status === 500
        ? 'אירעה שגיאה בשרת. נסו שוב מאוחר יותר.'
        : err.message;

    if (req.xhr) {
        return res.status(status).json({ error: message });
    }

    res.status(status).render('error', { title: 'שגיאה', message });
};