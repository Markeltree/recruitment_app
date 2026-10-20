const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');

(async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`ApplyUp API running on http://localhost:${config.port}/api/v1`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
