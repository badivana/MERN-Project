const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const connectDB = require("./db");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Serve Client Assets in Production
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// For SPA routing, fallback to index.html
app.get("/*splat", (req, res, next) => {
    // If the request starts with /api, pass it to next (which will hit 404 handler)
    if (req.path.startsWith("/api")) {
        return next();
    }
    res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
        if (err) {
            // If client has not been built yet, show a welcome message for developer
            res.status(200).send("🚀 QuantumTask API Server is running. Frontend build not detected. Please run the frontend dev server.");
        }
    });
});

// ✅ Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("❌ Global Error Handler Caught:", err.message);
    res.status(500).json({
        message: "An internal server error occurred",
        error: process.env.NODE_ENV === "development" ? err.message : {}
    });
});

// ✅ Server Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 QuantumTask Server humming on: http://localhost:${PORT}`);
});