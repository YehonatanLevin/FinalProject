exports.index = (req, res) => {
    res.render('map', {
        title: 'מפת מסלולים',
        mapsApiKey: process.env.MAPS_API_KEY || ''
    });
};
