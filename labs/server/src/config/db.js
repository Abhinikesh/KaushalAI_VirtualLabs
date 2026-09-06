const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaushalai_labs';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Labs MongoDB] Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.warn(`[Labs MongoDB] Connection warning: ${error.message}`);
    console.warn('[Labs MongoDB] Running without persistent DB connection (Part 1 skeleton mode).');
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Labs MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[Labs MongoDB] Disconnected');
  });
};

module.exports = connectDB;
