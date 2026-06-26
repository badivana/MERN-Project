const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mern_pro";
        await mongoose.connect(uri);
        console.log("✅ MongoDB connected successfully to:", uri);
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
