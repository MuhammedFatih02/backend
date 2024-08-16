import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: [{ type: String, required: true }],
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  companyImgURL: { type: String, required: false }, // Firmanın resmi için yeni alan eklendi
  mainCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mainCategories',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subCategories',
    required: true
  },
  stock: { type: Number, required: true }, // Stok miktarı
  brand: { type: String, required: true }, // Marka
  specifications: [{
    key: { type: String, required: false },
    value: { type: String, required: false },
  }], // Ürün özellikleri
  variants: [{
    color: { type: String, required: false },
    size: { type: String, required: false },
    price: { type: Number, required: false }
  }] // Ürün varyantları
}, { timestamps: true }); // timestamps seçeneği eklendi

productSchema.index({ title: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
