exports.index = (req, res) => {
    res.render('index', { title: 'RunTogether' });
};

exports.about = (req, res) => {
    res.render('about', { title: 'אודות' });
};