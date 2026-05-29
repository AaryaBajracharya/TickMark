const { Category, Subcategory } = require('../model');
const { formatCurrency, specsToText } = require('../utils/format');
const { getCsrfToken } = require('./csrfMiddleware');
const config = require('../config/env');

async function localsMiddleware(req, res, next) {
  try {
    res.locals.categories = await Category.find().sort({ name: 1 }).lean();
    res.locals.subcategories = await Subcategory.find().sort({ name: 1 }).lean();
    res.locals.messages = req.flash();
    res.locals.session = req.session;
    res.locals.path = req.path;
    res.locals.query = req.query;
    res.locals.formatCurrency = formatCurrency;
    res.locals.specsToText = specsToText;
    res.locals.storePhone = config.storePhone;
    res.locals.csrfToken = getCsrfToken(req);
    res.locals.csrfInput = `<input type="hidden" name="_csrf" value="${res.locals.csrfToken}">`;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = localsMiddleware;
