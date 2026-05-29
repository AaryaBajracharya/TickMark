const mongoose = require('mongoose');
const slugify = require('slugify');
const { Subcategory } = require('../model');
const { parseSpecs } = require('../utils/format');

async function productFormPayload(body) {
  const onSale = body.on_sale === 'on';
  const payload = {
    name: body.name,
    slug: slugify(`${body.name || ''}-${body.model || ''}`, { lower: true, strict: true }),
    brand: body.brand,
    model: body.model,
    price: Number(body.price || 0),
    description: body.description,
    category: body.category_id,
    subcategory: body.subcategory_id || null,
    imageUrl: body.image_url,
    galleryImages: String(body.gallery_images || '')
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean),
    onSale,
    salePrice: onSale ? Number(body.sale_price || 0) : undefined,
    showOnHome: body.show_on_home === 'on',
    bestSeller: body.best_seller === 'on',
    stockStatus: body.stock_status || 'in_stock',
    warranty: body.warranty,
    installationIncluded: body.installation_included === 'on',
    emiAvailable: body.emi_available === 'on',
    energyRating: body.energy_rating,
    capacity: body.capacity,
    deliveryNote: body.delivery_note,
    specs: parseSpecs(body.specs),
  };

  if (payload.subcategory && mongoose.isValidObjectId(payload.subcategory)) {
    const matchingSubcategory = await Subcategory.findOne({
      _id: payload.subcategory,
      category: payload.category,
    });
    if (!matchingSubcategory) payload.subcategory = null;
  } else {
    payload.subcategory = null;
  }

  return payload;
}

module.exports = productFormPayload;
