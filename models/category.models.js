const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    enum: ["Men", "Women", "Kids", "Electronics", "Home"],
    required: true,
  },
  categoryImageUrl: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
