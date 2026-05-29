const express = require('express');
const storeController = require('../controllers/storeController');
const { requireCsrf } = require('../middleware/csrfMiddleware');
const { publicFormLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.get('/', storeController.home);
router.get('/products', storeController.products);
router.get('/product/:id', storeController.productDetail);
router.post('/product/:id/reviews', publicFormLimiter, requireCsrf, storeController.addReview);
router.get('/search', storeController.search);
router.post('/inquiry', publicFormLimiter, requireCsrf, storeController.inquiry);
router.post('/newsletter', publicFormLimiter, requireCsrf, storeController.newsletter);
router.get('/contact', storeController.contact);

module.exports = router;
