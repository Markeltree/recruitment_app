const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, cb) => {
      // Mobile apps send no Origin header; allow them.
      if (!origin || config.clientOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
