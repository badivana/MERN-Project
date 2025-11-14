const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/mern_pro")
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("❌ DB error:", err));

const User = mongoose.model("User", new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
}));

// ========== API ROUTES ==========

// Signup
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username and password required" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    await new User({ username, password: hash }).save();
    res.json({ message: "User registered" });
});

// Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username }, "secretkey", { expiresIn: "1h" });
    res.json({ token });
});

// Auth check
app.get("/auth", (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token" });
    const token = auth.split(" ")[1];
    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        res.json({ message: "Welcome " + user.username });
    });
});

// ✅ Serve frontend (Express 5 safe)
app.use(express.static(path.join(__dirname, "frontend")));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(3000, () => console.log("✅ Server running: http://localhost:3000"));
