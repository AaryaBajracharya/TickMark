const express = require('express');
const storeRoutes = require('./store.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use(storeRoutes);
router.use(authRoutes);
router.use(adminRoutes);

module.exports = router;
