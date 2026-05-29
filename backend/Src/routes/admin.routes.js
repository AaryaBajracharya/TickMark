const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { requireCsrf } = require('../middleware/csrfMiddleware');

const router = express.Router();

router.use(requireAdmin);

router.get('/admin', adminController.dashboard);
router.get('/admin/add', adminController.addProductPage);
router.post('/admin/add', requireCsrf, adminController.addProduct);
router.get('/admin/edit/:id', adminController.editProductPage);
router.post('/admin/edit/:id', requireCsrf, adminController.editProduct);
router.post('/admin/delete/:id', requireCsrf, adminController.deleteProduct);

router.get('/admin/categories', adminController.categoriesPage);
router.get('/admin/categories/add', adminController.addCategoryPage);
router.post('/admin/categories/add', requireCsrf, adminController.addCategory);
router.post('/admin/categories/delete/:id', requireCsrf, adminController.deleteCategory);

router.get('/admin/subcategories/add', adminController.addSubcategoryPage);
router.post('/admin/subcategories/add', requireCsrf, adminController.addSubcategory);
router.post('/admin/subcategories/delete/:id', requireCsrf, adminController.deleteSubcategory);

router.get('/admin/inquiries', adminController.inquiriesPage);
router.post('/admin/inquiries/:id/status', requireCsrf, adminController.updateInquiryStatus);

router.get('/admin/reviews', adminController.reviewsPage);
router.post('/admin/reviews/delete/:id', requireCsrf, adminController.deleteReview);

module.exports = router;
