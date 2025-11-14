
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        mongoose.connect("mongodb://localhost:27017/mern_pro");
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ DB error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
