const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  repeatPassword: String,
});

module.exports = mongoose.model("users", userSchema);
