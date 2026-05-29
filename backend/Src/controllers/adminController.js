const slugify = require('slugify');
const { Category, Subcategory, Product, Review, Inquiry } = require('../model');
const productFormPayload = require('../data/productFormPayload');

async function dashboard(req, res, next) {
  try {
    const products = await Product.find().populate('category').populate('subcategory').sort({ createdAt: -1 }).lean({ virtuals: true });
    const stats = {
      products: await Product.countDocuments(),
      inquiries: await Inquiry.countDocuments({ status: 'new' }),
      reviews: await Review.countDocuments(),
      categories: await Category.countDocuments(),
      subcategories: await Subcategory.countDocuments(),
    };
    res.render('admin/admin', { products, stats });
  } catch (error) {
    next(error);
  }
}

async function addProductPage(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const subcategories = await Subcategory.find().populate('category').sort({ name: 1 }).lean();
    res.render('admin/admin_add', { categories, subcategories });
  } catch (error) {
    next(error);
  }
}

async function addProduct(req, res, next) {
  try {
    await Product.create(await productFormPayload(req.body));
    req.flash('success', 'Product added.');
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
}

async function editProductPage(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).lean({ virtuals: true });
    if (!product) return res.status(404).render('general/not_found', { title: 'Product not found' });
    const categories = await Category.find().sort({ name: 1 }).lean();
    const subcategories = await Subcategory.find().populate('category').sort({ name: 1 }).lean();
    res.render('admin/admin_edit', { product, categories, subcategories });
  } catch (error) {
    next(error);
  }
}

async function editProduct(req, res, next) {
  try {
    await Product.findByIdAndUpdate(req.params.id, await productFormPayload(req.body), { runValidators: true });
    req.flash('success', 'Product updated.');
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await Product.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ product: req.params.id });
    req.flash('success', 'Product deleted.');
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
}

async function categoriesPage(req, res, next) {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id',
          foreignField: 'category',
          as: 'subcategories',
        },
      },
      { $sort: { name: 1 } },
    ]);
    res.render('admin/admin_categories', { categories });
  } catch (error) {
    next(error);
  }
}

function addCategoryPage(req, res) {
  res.render('admin/admin_category_add');
}

async function addCategory(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      req.flash('danger', 'Category name is required.');
      return res.redirect('/admin/categories/add');
    }
    await Category.create({ name, slug: slugify(name, { lower: true, strict: true }) });
    req.flash('success', `Category "${name}" added.`);
    res.redirect('/admin/categories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('danger', 'Category already exists.');
      return res.redirect('/admin/categories/add');
    }
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    const subcategoryCount = await Subcategory.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      req.flash('danger', 'Cannot delete a category that still has products.');
    } else if (subcategoryCount > 0) {
      req.flash('danger', 'Cannot delete a category that still has subcategories.');
    } else {
      await Category.findByIdAndDelete(req.params.id);
      req.flash('success', 'Category deleted.');
    }
    res.redirect('/admin/categories');
  } catch (error) {
    next(error);
  }
}

async function addSubcategoryPage(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.render('admin/admin_subcategory_add', { categories });
  } catch (error) {
    next(error);
  }
}

async function addSubcategory(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const category = req.body.category_id;
    if (!name || !category) {
      req.flash('danger', 'Subcategory name and category are required.');
      return res.redirect('/admin/subcategories/add');
    }
    await Subcategory.create({
      name,
      category,
      slug: slugify(name, { lower: true, strict: true }),
    });
    req.flash('success', `Subcategory "${name}" added.`);
    res.redirect('/admin/categories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('danger', 'That subcategory already exists for this category.');
      return res.redirect('/admin/subcategories/add');
    }
    next(error);
  }
}

async function deleteSubcategory(req, res, next) {
  try {
    const productCount = await Product.countDocuments({ subcategory: req.params.id });
    if (productCount > 0) {
      req.flash('danger', 'Cannot delete a subcategory that still has products.');
    } else {
      await Subcategory.findByIdAndDelete(req.params.id);
      req.flash('success', 'Subcategory deleted.');
    }
    res.redirect('/admin/categories');
  } catch (error) {
    next(error);
  }
}

async function inquiriesPage(req, res, next) {
  try {
    const inquiries = await Inquiry.find().populate('product').sort({ createdAt: -1 }).lean();
    res.render('admin/admin_inquiries', { inquiries });
  } catch (error) {
    next(error);
  }
}

async function updateInquiryStatus(req, res, next) {
  try {
    await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/admin/inquiries');
  } catch (error) {
    next(error);
  }
}

async function reviewsPage(req, res, next) {
  try {
    const reviews = await Review.find().populate('product').sort({ createdAt: -1 }).lean();
    res.render('admin/admin_reviews', { reviews });
  } catch (error) {
    next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    await Review.findByIdAndDelete(req.params.id);
    req.flash('success', 'Review deleted.');
    res.redirect('/admin/reviews');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboard,
  addProductPage,
  addProduct,
  editProductPage,
  editProduct,
  deleteProduct,
  categoriesPage,
  addCategoryPage,
  addCategory,
  deleteCategory,
  addSubcategoryPage,
  addSubcategory,
  deleteSubcategory,
  inquiriesPage,
  updateInquiryStatus,
  reviewsPage,
  deleteReview,
};
