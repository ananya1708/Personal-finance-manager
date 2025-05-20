const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true }, // ✅ Ensure email is always stored in lowercase
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
