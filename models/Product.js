const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    size: { type: String, required: true, enum: ['XS', 'S', 'M', 'L', 'XL', 'One Size'] },
    category: { type: String, required: true, enum: ['Denim', 'Dresses', 'Outerwear', 'Ethnic Wear', 'Accessories'] },
    condition: { type: String, required: true, enum: ['Like New', 'Gently Loved', 'Well-Loved'] },
    material: { type: String, default: '' },
    description: { type: String, default: '' },
    images: [{ type: String }],
    isSold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
