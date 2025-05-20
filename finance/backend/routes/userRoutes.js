const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("../models/user");
require("dotenv").config();

const router = express.Router();
router.use(cors()); // Enable CORS for this route

// ✅ User Registration Route
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    email = email.toLowerCase(); // Normalize email

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // ✅ Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ✅ User Login Route
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase();
    console.log("🔍 Searching for email:", email);

    // Find user by email
    const user = await User.findOne({ email });
    console.log("🛠 Found user:", user);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in .env file");
      return res.status(500).json({ error: "Server Error: JWT_SECRET missing" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Generated Token:", token);

    // ✅ Store token in HTTP-only cookie (Optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.json({ 
      message: "Login successful", 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
