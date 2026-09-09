const mongoose = require('mongoose');

function effective(price, salePrice) {
  if (salePrice === null || salePrice === undefined || salePrice === '') return Number(price);
  const p = Number(price);
  const s = Number(salePrice);
  if (Number.isNaN(p)) return 0;
  return Number.isNaN(s) || s >= p ? p : s;
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, trim: true },
    category: { type: String, index: true },
    description: String,
    specs: {
      material: String,
      weight: String,
      capacity: String,
      color: String,
      origin: String,
    },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    effectivePrice: { type: Number },
    stock: { type: Number, default: 0, min: 0 },
    images: [{ url: String, public_id: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    updatedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

productSchema.pre('save', function (next) {
  this.effectivePrice = effective(this.price, this.salePrice);
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  const u = this.getUpdate();
  const set = (u && u.$set) || u || {};
  const price = set.price !== undefined ? set.price : set.price;
  const sale = set.salePrice;
  if (price !== undefined && sale !== undefined) {
    set.effectivePrice = effective(price, sale);
  }
  next();
});

productSchema.virtual('stockStatus').get(function () {
  if (this.stock <= 0) return 'out';
  if (this.stock <= 5) return 'low';
  return 'in';
});

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    if (ret.effectivePrice === undefined || ret.effectivePrice === null) {
      ret.effectivePrice = effective(ret.price, ret.salePrice);
    }
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);