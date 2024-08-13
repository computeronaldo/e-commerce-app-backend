const mongoose = require("mongoose");

const mongodb_URI = process.env.MONGODB_URI;

const initializeDatabase = async () => {
  try {
    const connection = await mongoose.connect(mongodb_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (connection) {
      console.log("Connected to DB successfully!");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = initializeDatabase;
