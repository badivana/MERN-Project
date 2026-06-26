const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Helper
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || "supersecretkey_quantumtask_2026";
    return jwt.sign(
        { id: user._id, username: user.username },
        secret,
        { expiresIn: "24h" }
    );
};

// Signup
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(409).json({ message: "Username is already taken" });
        }

        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(409).json({ message: "Email is already registered" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            username,
            email: email || undefined,
            password: hashedPassword
        });

        await newUser.save();
        const token = generateToken(newUser);

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                bio: newUser.bio,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
};

// Google OAuth Login / Signup
exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "Google ID token required" });
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } catch (verifyErr) {
            console.error("Google token verification failed:", verifyErr.message);
            return res.status(400).json({ message: "Google Authentication failed: Invalid ID token" });
        }

        const { email, sub: googleId, name, picture } = payload;
        if (!email) {
            return res.status(400).json({ message: "Google account must have an email address" });
        }

        // 1. Try to find user by googleId
        let user = await User.findOne({ googleId });

        // 2. If not found, try to find user by email
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                await user.save();
            }
        }

        // 3. If still not found, create new Google user
        if (!user) {
            // Generate a unique username
            let baseUsername = name.replace(/\s+/g, "").toLowerCase().slice(0, 15);
            let username = baseUsername;
            let count = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${count}`;
                count++;
            }

            user = new User({
                username,
                email,
                googleId,
                avatar: "cosmic-blue", // Default avatar color preset
                bio: "Navigating using Google Spaceship.",
                role: "Workspace Commander"
            });
            await user.save();
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(500).json({ message: "Server error during Google Authentication" });
    }
};

// Get Me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ message: "Server error fetching user details" });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { username, email, bio, avatar, oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify username unique if changed
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(409).json({ message: "Username is already taken" });
            }
            user.username = username;
        }

        // Verify email unique if changed
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(409).json({ message: "Email is already taken" });
            }
            user.email = email;
        }

        if (bio !== undefined) user.bio = bio;
        if (avatar) user.avatar = avatar;

        // Change Password logic (for non-Google users or Google users setting password)
        if (newPassword) {
            if (user.password) {
                if (!oldPassword) {
                    return res.status(400).json({ message: "Current password is required to change password" });
                }
                const isMatch = await bcrypt.compare(oldPassword, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: "Incorrect current password" });
                }
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role
            }
        });
    } catch (err) {
        console.error("UpdateProfile error:", err);
        res.status(500).json({ message: "Server error updating profile" });
    }
};

// Expose Google Client ID
exports.getGoogleClientId = (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID || "" });
};
