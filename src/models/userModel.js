const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: String,
  lastName: String,
  age: Number,
  movies: [String],
});

module.exports = mongoose.model("users", userSchema);
