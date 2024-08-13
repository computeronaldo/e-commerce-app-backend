const express = require("express");
const cors = require("cors");
// const fs = require("fs");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
};

// setting up middleware
app.use(express.json());
app.use(cors(corsOptions));

// const seedData = () => {
//   fs.readFile("./products.json", "utf-8", (err, data) => {
//     if (err) {
//       console.error("Error reading the file:", err);
//       return;
//     }
//     const products = JSON.parse(data);
//     products.forEach((product) => {
//       addProduct(product);
//     });
//   });
// };

// seedData();
const initializeDatabase = require("./db/db.js");

const Category = require("./models/category.models.js");
const Product = require("./models/product.models.js");
const Order = require("./models/order.models.js");
const { User, Address } = require("./models/user.models.js");
// setting up connection to our db
initializeDatabase();

// order
app.get("/order/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userOrders = await findUserOrders(userId);
    if (userOrders.length === 0) {
      return res.status(404).json({ error: "No orders found." });
    }
    res
      .status(200)
      .json({ message: "Orders fetched successfully.", orders: userOrders });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/order", async (req, res) => {
  const orderInfo = req.body;

  try {
    const savedOrder = await saveOrder(orderInfo);
    res
      .status(200)
      .json({ message: "Order placed successfully.", order: savedOrder });
  } catch (error) {
    if (error.name === "ValidationError") {
      let inputValidationErrors = {};

      Object.keys(error.errors).forEach((key) => {
        inputValidationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({ error: inputValidationErrors });
    }
    res.status(500).json({ error: "Something went wrong." });
  }
});

// address
app.post("/address/:addressId", async (req, res) => {
  const { addressId } = req.params;
  const { username, address } = req.body;

  try {
    const updatedUser = await updateUserEditAddress(
      addressId,
      username,
      address,
    );
    res
      .status(200)
      .json({ message: "Address updated successfully", user: updatedUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      let inputValidationErrors = {};

      Object.keys(error.errors).forEach((key) => {
        inputValidationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({ error: inputValidationErrors });
    }
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.post("/address", async (req, res) => {
  const { username, address } = req.body;

  try {
    const updatedUser = await updateUserAddAddress(username, address);
    res
      .status(200)
      .json({ message: "Address added successfully", user: updatedUser });
  } catch (error) {
    console.log(error.name);
    if (error.name === "ValidationError") {
      let inputValidationErrors = {};

      Object.keys(error.errors).forEach((key) => {
        inputValidationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({ error: inputValidationErrors });
    }
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.delete("/address/:addressId", async (req, res) => {
  const { addressId } = req.params;
  const { username } = req.body;

  try {
    const updatedUser = await updateUserDeleteAddress(username, addressId);
    res
      .status(201)
      .json({ message: "Address deleted successfully.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

// wishlist
app.post("/wishlist", async (req, res) => {
  const { username, productId } = req.body;

  try {
    const updatedUser = await updateUserAddToWishlist(username, productId);
    res
      .status(200)
      .json({ message: "Product added to wishlist.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.delete("/wishlist", async (req, res) => {
  const { username, productId } = req.body;

  try {
    const updatedUser = await updateUserRemoveFromWishlist(username, productId);
    res
      .status(200)
      .json({ message: "Product removed to wishlist.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

const findUserOrders = async (userId) => {
  try {
    const orders = await Order.find({ user: userId })
      .populate({ path: "products.product", model: "Product" })
      .sort({ createdAt: -1 })
      .exec();
    return orders;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const saveOrder = async (orderInfo) => {
  const newOrder = new Order(orderInfo);

  try {
    const savedOrder = await newOrder.save();
    return savedOrder;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserDeleteAddress = async (username, addressId) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $pull: { addresses: { _id: addressId } } },
      { new: true },
    );

    return updatedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserEditAddress = async (addressId, username, address) => {
  try {
    const addressInstance = new Address(address);

    const validationError = addressInstance.validateSync();
    if (validationError) {
      throw validationError;
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: username, "addresses._id": addressId }, // Find the user and address
      {
        $set: {
          "addresses.$.buildingNumber": address.buildingNumber,
          "addresses.$.streetName": address.streetName,
          "addresses.$.location": address.location,
          "addresses.$.city": address.city,
          "addresses.$.pincode": address.pincode,
        },
      },
      { new: true, runValidators: true },
    );
    return updatedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserAddAddress = async (username, address) => {
  try {
    const addressInstance = new Address(address);

    const validationError = addressInstance.validateSync();
    if (validationError) {
      throw validationError;
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $addToSet: { addresses: address } },
      { new: true },
    );
    return updatedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserRemoveFromWishlist = async (username, productId) => {
  console.log(username, productId);
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $pull: { wishlist: productId } }, // $pull removes the specified productId from the wishlist
      { new: true },
    );
    return updatedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserAddToWishlist = async (username, productId) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      { $addToSet: { wishlist: productId } }, // $addToSet ensures no duplicates
      { new: true },
    );
    return updatedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// user
app.post("/login", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await findUser(username);
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist." });
    }

    res.status(200).json({ message: "Login successful.", user: user });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.post("/register", async (req, res) => {
  const user = req.body;
  try {
    const registeredUser = await registerUser(user);
    console.log(registeredUser);
    res
      .status(201)
      .json({ message: "User created successfully.", user: registeredUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      let inputValidationErrors = {};

      Object.keys(error.errors).forEach((key) => {
        inputValidationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({ error: inputValidationErrors });
    } else if (error.code === 11000) {
      return res.status(400).json({
        error: "Username already exists. Please choose a different username",
      });
    }
    res.status(500).json({ error: "Something went wrong." });
  }
});

// search products
app.get("/search", async (req, res) => {
  try {
    const title = req.query.title;
    console.log(title);
    const products = await Product.find({
      productName: { $regex: title, $options: "i" }, // case-insensitive search
    });
    console.log(products);
    if (products.length === 0) {
      res.status(404).json({ error: "No products found!" });
    } else {
      res.status(200).json({
        message: "Products information fetched successfully.",
        data: products,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

// user router handlers
const findUser = async (username) => {
  try {
    const user = await User.findOne({ username: username });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const registerUser = async (user) => {
  const newUser = new User(user);
  try {
    const registeredUser = await newUser.save();
    return registeredUser;
  } catch (error) {
    throw error;
  }
};

// product route handlers
const updateProduct = async (productId, updatedProduct) => {
  try {
    const product = await Product.findByIdAndUpdate(productId, updatedProduct);
    return product;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const addProduct = async (product) => {
  const newProduct = new Product(product);

  try {
    const savedProduct = await newProduct.save();
    return savedProduct;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllProducts = async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    throw new Error(error);
  }
};

const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId);
    return product;
  } catch (error) {
    throw new Error(error);
  }
};

// /products routes
app.post("/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const updatedProduct = await updateProduct(productId, req.body, {
      new: true,
    });
    res.status(201).json({
      message: "Product information updated successfully.",
      category: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product information." });
  }
});

app.post("/products", async (req, res) => {
  try {
    const newProduct = await addProduct(req.body);
    res.status(201).json({ message: "New product added", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product." });
  }
});

app.get("/products", async (_req, res) => {
  try {
    const products = await getAllProducts();
    if (products.length === 0) {
      res.status(404).json({ error: "No products found." });
    } else {
      res.status(200).json({
        message: "Products info fetched successfully.",
        data: products,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products information." });
  }
});

app.get("/products/:productId", async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
    } else {
      res.status(200).json({
        message: "Product information fetched successfully.",
        data: product,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed tp fetch product information." });
  }
});

// categories route handlers
const updateCategory = async (categoryId, updatedCategory) => {
  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      updatedCategory,
    );
    return category;
  } catch (error) {
    throw new Error(error);
  }
};

const addCategory = async (category) => {
  const newCategory = new Category(category);

  try {
    const category = await newCategory.save();
    return category;
  } catch (error) {
    throw new Error(error);
  }
};
const getAllCategories = async () => {
  try {
    const categories = await Category.find();
    return categories;
  } catch (error) {
    throw new Error(error);
  }
};

const getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    return category;
  } catch (error) {
    throw new Error(error);
  }
};

// /categories routes
app.post("/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updatedCategory = await updateCategory(categoryId, req.body, {
      new: true,
    });
    res.status(201).json({
      message: "Category information updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update category information." });
  }
});

app.post("/categories", async (req, res) => {
  try {
    const newCategory = await addCategory(req.body);
    res
      .status(201)
      .json({ message: "New category added", category: newCategory });
  } catch (error) {
    res.status(500).json({ error: "Failed to add category information." });
  }
});

app.get("/categories", async (_req, res) => {
  try {
    const categories = await getAllCategories();
    if (categories.length === 0) {
      res.status(404).json({ error: "Categories information not found." });
    } else {
      res.status(200).json({
        message: "Category information fetched successfully.",
        categories: categories,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories information." });
  }
});

app.get("/categories/:categoryId", async (req, res) => {
  try {
    const category = await getCategoryById(req.params.categoryId);
    if (!category) {
      res.status(404).json({ error: "No category information found." });
    } else {
      res.status(200).json({
        message: "Category information fetched successfully.",
        category: category,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category information." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
