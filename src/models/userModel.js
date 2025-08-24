const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  repeatPassword: String,
  ownedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'songs' }],
});

module.exports = mongoose.model("users", userSchema);
