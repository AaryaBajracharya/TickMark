const express = require('express');
const authController = require('../controllers/authController');
const { requireCsrf } = require('../middleware/csrfMiddleware');
const { adminLoginLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.get('/admin/login', authController.loginPage);
router.post('/admin/login', adminLoginLimiter, requireCsrf, authController.login);
router.get('/admin/logout', authController.logout);

module.exports = router;
