// Vercel serverless entry: wraps the Express app (src/server.js is for local/long-running hosts)
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Reuse one DB connection across warm invocations; retry on the next request if it failed
let ready;
let lastError = null;

const connect = () => {
  ready =
    ready ||
    connectDB()
      .then(() => {
        lastError = null;
      })
      .catch((err) => {
        ready = null;
        lastError = err;
        throw err;
      });
  return ready;
};

const sendJson = (res, status, body) => {
  // Plain Node response API: this runs before Express has wrapped `res`
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

module.exports = async (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  // Health check answers even when the database is down, and says which part is failing
  if (req.url.split('?')[0] === '/api/v1/health') {
    if (!connected) await connect().catch(() => {});
    const dbUp = mongoose.connection.readyState === 1;
    return sendJson(res, dbUp ? 200 : 503, {
      success: dbUp,
      status: dbUp ? 'ok' : 'degraded',
      api: 'up',
      database: dbUp ? 'connected' : 'unreachable',
      hint: dbUp ? undefined : 'Check MONGODB_URI and MongoDB Atlas > Network Access (allow 0.0.0.0/0)',
      time: new Date(),
    });
  }

  if (!connected) {
    try {
      await connect();
    } catch (err) {
      console.error('[api] database connection failed:', err.message);
      return sendJson(res, 503, { success: false, message: 'Service temporarily unavailable' });
    }
  }
  return app(req, res);
};

module.exports.lastError = () => lastError;
