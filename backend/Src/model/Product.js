const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, index: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
    imageUrl: { type: String, trim: true },
    galleryImages: [{ type: String, trim: true }],
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number, min: 0 },
    showOnHome: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'preorder'],
      default: 'in_stock',
    },
    warranty: { type: String, default: '1 year official warranty' },
    installationIncluded: { type: Boolean, default: false },
    emiAvailable: { type: Boolean, default: false },
    energyRating: { type: String, trim: true },
    capacity: { type: String, trim: true },
    deliveryNote: { type: String, default: 'Delivery available in Kathmandu Valley' },
    specs: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

productSchema.pre('save', function buildProductSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(`${this.name}-${this.model || ''}`, { lower: true, strict: true });
  }
  next();
});

productSchema.virtual('effectivePrice').get(function effectivePrice() {
  return this.onSale && this.salePrice ? this.salePrice : this.price;
});

module.exports = mongoose.model('Product', productSchema);
