const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log("MongoDB connected successfully");
};

module.exports = connectDB;