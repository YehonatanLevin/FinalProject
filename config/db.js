const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/runtogether';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connected:', mongoose.connection.name);
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        console.error('Is mongod running?');
        process.exit(1);
    }
}

module.exports = connectDB;