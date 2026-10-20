// Vercel serverless entry: wraps the Express app (src/server.js is for local/long-running hosts)
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Reuse one DB connection across warm invocations; retry on the next request if it failed
let ready;

module.exports = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    ready =
      ready ||
      connectDB().catch((err) => {
        ready = null;
        throw err;
      });
    try {
      await ready;
    } catch (err) {
      console.error('[api] database connection failed:', err.message);
      // Plain Node response API: this runs before Express has wrapped `res`
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, message: 'Service temporarily unavailable' }));
    }
  }
  return app(req, res);
};
