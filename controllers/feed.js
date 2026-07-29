/* גרסה זמנית. B מחליף אותה במשימה B9. */
exports.index = (req, res) => {
    res.render('index', { title: 'RunTogether' });
};

exports.mine = (req, res) => {
    res.render('index', { title: 'הפוסטים שלי' });
};