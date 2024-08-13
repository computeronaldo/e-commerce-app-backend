const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productCategory: {
    type: String,
    enum: ["Men", "Women", "Kids", "Electronics", "Home"],
    required: true,
  },
  productRating: {
    type: Number,
    required: true,
    default: 2.5,
    min: 1,
    max: 5,
  },
  discountRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 70,
  },
  productImageUrl: {
    type: String,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema)

module.exports = { productSchema };
module.exports = Product;