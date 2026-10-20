require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/applyup',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://localhost:8081')
    .split(',')
    .map((s) => s.trim()),
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@applyup.app',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
};

if (config.env === 'production' && config.jwt.secret === 'dev-secret-change-me') {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = config;
