const UNITS = [
    { limit: 60, div: 1, one: 'לפני שנייה', many: n => 'לפני ' + n + ' שניות' },
    { limit: 3600, div: 60, one: 'לפני דקה', many: n => 'לפני ' + n + ' דקות' },
    { limit: 86400, div: 3600, one: 'לפני שעה', many: n => 'לפני ' + n + ' שעות' },
    { limit: 2592000, div: 86400, one: 'אתמול', many: n => 'לפני ' + n + ' ימים' },
    { limit: 31536000, div: 2592000, one: 'לפני חודש', many: n => 'לפני ' + n + ' חודשים' }
];

module.exports = function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 10) return 'ממש עכשיו';

    for (const unit of UNITS) {
        if (seconds < unit.limit) {
            const value = Math.floor(seconds / unit.div);
            return value === 1 ? unit.one : unit.many(value);
        }
    }
    const years = Math.floor(seconds / 31536000);
    return years === 1 ? 'לפני שנה' : 'לפני ' + years + ' שנים';
};