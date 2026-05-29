const mongoose = require('mongoose');
const { Category, Subcategory, Product, Review, Inquiry, Newsletter } = require('../model');

async function home(req, res, next) {
  try {
    const featured = await Product.find({ showOnHome: true }).populate('category').limit(8).lean({ virtuals: true });
    const bestSellers = await Product.find({ bestSeller: true }).populate('category').limit(8).lean({ virtuals: true });
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 }).limit(3).populate('product').lean();
    res.render('home/home', { featured, bestSellers, reviews });
  } catch (error) {
    next(error);
  }
}

async function products(req, res, next) {
  try {
    const { category, subcategory, brand, stock, sort, sale } = req.query;
    const minPrice = Number(req.query.min_price || 0);
    const maxPrice = Number(req.query.max_price || 300000);
    const filter = { price: { $gte: minPrice, $lte: maxPrice } };
    let selectedCategory = null;
    let selectedSubcategory = null;

    if (category) {
      const categoryQuery = [{ name: category }, { slug: category }];
      if (mongoose.isValidObjectId(category)) categoryQuery.push({ _id: category });
      selectedCategory = await Category.findOne({ $or: categoryQuery });
      if (selectedCategory) filter.category = selectedCategory._id;
    }

    if (subcategory && selectedCategory) {
      const subcategoryQuery = [{ name: subcategory }, { slug: subcategory }];
      if (mongoose.isValidObjectId(subcategory)) subcategoryQuery.push({ _id: subcategory });
      selectedSubcategory = await Subcategory.findOne({
        category: selectedCategory._id,
        $or: subcategoryQuery,
      });
      if (selectedSubcategory) filter.subcategory = selectedSubcategory._id;
    }

    if (brand) filter.brand = new RegExp(`^${brand}$`, 'i');
    if (stock) filter.stockStatus = stock;
    if (sale === 'on') filter.onSale = true;

    const sortOptions = {
      newest: { createdAt: -1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
      name: { name: 1 },
    };

    const productsList = await Product.find(filter)
      .populate('category')
      .populate('subcategory')
      .sort(sortOptions[sort] || sortOptions.newest)
      .lean({ virtuals: true });
    const brands = await Product.distinct('brand', { brand: { $nin: [null, ''] } });
    const availableSubcategories = selectedCategory ? await Subcategory.find({ category: selectedCategory._id }).sort({ name: 1 }).lean() : [];

    res.render('minipage/products', {
      products: productsList,
      brands: brands.sort(),
      availableSubcategories,
      currentCategory: selectedCategory ? String(selectedCategory._id) : '',
      currentSubcategory: selectedSubcategory ? String(selectedSubcategory._id) : '',
      currentBrand: brand,
      minPrice,
      maxPrice,
      currentStock: stock,
      currentSort: sort || 'newest',
      saleOnly: sale === 'on',
    });
  } catch (error) {
    next(error);
  }
}

async function productDetail(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('category').populate('subcategory').lean({ virtuals: true });
    if (!product) return res.status(404).render('general/not_found', { title: 'Product not found' });
    const similarProducts = await Product.find({ category: product.category._id, _id: { $ne: product._id } }).limit(8).lean({ virtuals: true });
    const reviews = await Review.find({ product: product._id, approved: true }).sort({ createdAt: -1 }).lean();
    res.render('minipage/product_detail', { product, similarProducts, reviews });
  } catch (error) {
    next(error);
  }
}

async function addReview(req, res, next) {
  try {
    await Review.create({
      product: req.params.id,
      name: req.body.name,
      rating: Number(req.body.rating || 5),
      comment: req.body.comment,
    });
    req.flash('success', 'Thanks for the review.');
    res.redirect(`/product/${req.params.id}#reviews`);
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  try {
    const searchTerm = String(req.query.q || '').trim();
    const filter = searchTerm
      ? {
          $or: ['name', 'brand', 'model', 'description', 'capacity', 'energyRating'].map((field) => ({
            [field]: new RegExp(searchTerm, 'i'),
          })),
        }
      : { _id: null };
    const results = await Product.find(filter).populate('category').populate('subcategory').lean({ virtuals: true });
    res.render('general/search', { results, searchTerm });
  } catch (error) {
    next(error);
  }
}

async function inquiry(req, res, next) {
  try {
    await Inquiry.create({
      product: req.body.product_id || undefined,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message,
    });
    req.flash('success', 'Inquiry received. We will contact you soon.');
    res.redirect(req.get('Referrer') || '/contact');
  } catch (error) {
    next(error);
  }
}

async function newsletter(req, res) {
  try {
    await Newsletter.updateOne({ email: req.body.email }, { email: req.body.email }, { upsert: true });
    req.flash('success', 'You are subscribed to offers and launches.');
  } catch (error) {
    req.flash('danger', 'Could not subscribe right now.');
  }
  res.redirect(req.get('Referrer') || '/');
}

function contact(req, res) {
  res.render('general/contact');
}

module.exports = {
  home,
  products,
  productDetail,
  addReview,
  search,
  inquiry,
  newsletter,
  contact,
};
