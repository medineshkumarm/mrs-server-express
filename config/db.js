require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(url, {});
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};

module.exports = connectDB;
