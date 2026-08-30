const mongoose = require('mongoose');
const Route = require('../models/route');

const CODES = {
    0: 'בהיר', 1: 'בהיר בעיקר', 2: 'מעונן חלקית', 3: 'מעונן',
    45: 'ערפל', 48: 'ערפל קפוא', 51: 'טפטוף קל', 53: 'טפטוף',
    55: 'טפטוף חזק', 61: 'גשם קל', 63: 'גשם', 65: 'גשם חזק',
    71: 'שלג קל', 73: 'שלג', 75: 'שלג כבד', 80: 'ממטרים קלים',
    81: 'ממטרים', 82: 'ממטרים חזקים', 95: 'סופת רעמים'
};

/* Web Service חיצוני - Open-Meteo. חינמי, ללא מפתח API. */
exports.forRoute = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'מזהה מסלול לא תקין' });
    }

    try {
        const route = await Route.findById(req.params.id).select('lat lng name');
        if (!route) return res.status(404).json({ error: 'המסלול לא נמצא' });

        const url = 'https://api.open-meteo.com/v1/forecast'
            + '?latitude=' + route.lat
            + '&longitude=' + route.lng
            + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
            + '&timezone=auto';

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);

        let response;
        try {
            response = await fetch(url, { signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }

        if (!response.ok) {
            return res.status(502).json({ error: 'שירות מזג האוויר אינו זמין כרגע' });
        }

        const data = await response.json();
        const current = data.current || {};

        res.json({
            ok: true,
            route: route.name,
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            description: CODES[current.weather_code] || 'לא ידוע'
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            return res.status(504).json({ error: 'שירות מזג האוויר לא הגיב בזמן' });
        }
        next(err);
    }
};