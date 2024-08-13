const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
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
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  phoneNumber: {
    type: String,
    match: [/^[0-9]{10}$/, "Please fill a valid phone number"],
    required: true,
  },
  wishlist: [
    {
      type: String,
      unique: true,
    },
  ],
  addresses: [addressSchema],
});

const User = mongoose.model("User", userSchema);
const Address = mongoose.model("Address", addressSchema);

module.exports = { User, Address, addressSchema };
