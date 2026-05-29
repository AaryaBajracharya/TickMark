const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ejs = require('ejs');
const helmet = require('helmet');
const mongoose = require('mongoose');

const config = require('./Src/config/env');
const connectDatabase = require('./Src/config/database');
const seedCategories = require('./Src/data/seedCategories');
const localsMiddleware = require('./Src/middleware/localsMiddleware');
const { notFoundMiddleware, errorMiddleware } = require('./Src/middleware/errorMiddleware');
const routes = require('./Src/routes');

const app = express();

connectDatabase();

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '..', 'frontend', 'src', 'pages'));
app.use(expressLayouts);
app.set('layout', 'general/index');
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, '..', 'frontend', 'public')));
app.use(
  session({
    secret: config.sessionSecret,
    name: 'tickmark.sid',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoUri,
      ttl: 60 * 60 * 8,
      touchAfter: 60 * 10,
    }),
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);
app.use(flash());
app.use(localsMiddleware);
app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

mongoose.connection.once('open', () => {
  seedCategories().catch((error) => console.error('Category seed failed:', error.message));
});

const server = app.listen(config.port, config.host, () => {
  console.log(`Tick Mark app listening on ${config.host}:${config.port}`);
});

module.exports = { app, server };
