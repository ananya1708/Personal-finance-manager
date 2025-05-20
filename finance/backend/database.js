require('dotenv').config();  // Load environment variables
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;  // Use connection string from .env

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

module.exports = mongoose;
