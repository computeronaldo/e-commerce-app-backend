const mongoose = require("mongoose");

const Product = require("./product.models");
const { User } = require("./user.models");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: Product },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    cost: {
      type: String,
      required: true,
    },
    address: {
      buildingNumber: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return v.trim().length > 0;
          },
          message: "Building number cannot be empty",
        },
      },
      streetName: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return v.trim().length > 0;
          },
          message: "Street name cannot be empty",
        },
      },
      location: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return v.trim().length > 0;
          },
          message: "Location cannot be empty",
        },
      },
      city: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return v.trim().length > 0;
          },
          message: "City cannot be empty",
        },
      },
      pincode: {
        type: Number,
        required: true,
        validate: {
          validator: function (v) {
            return v.toString().trim().length > 0;
          },
          message: "Pincode cannot be empty",
        },
      },
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
