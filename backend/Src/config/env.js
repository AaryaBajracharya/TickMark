const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  isProduction,
  mongoUri: process.env.MONGODB_URI || (isProduction ? '' : 'mongodb://127.0.0.1:27017/tickmark'),
  storePhone: process.env.STORE_PHONE || '9779803971968',
  sessionSecret: process.env.SESSION_SECRET,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
};

const missing = [];
if (!config.mongoUri) missing.push('MONGODB_URI');
if (!config.sessionSecret || config.sessionSecret.length < 32) missing.push('SESSION_SECRET with at least 32 characters');
if (!config.adminUsername) missing.push('ADMIN_USERNAME');
if (!config.adminPassword || config.adminPassword.length < 12) missing.push('ADMIN_PASSWORD with at least 12 characters');

if (missing.length) {
  console.error(`Missing required environment values: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = config;
