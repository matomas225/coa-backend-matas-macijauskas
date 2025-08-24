const mongoose = require("mongoose");

const songSchema = mongoose.Schema({
  title: String,
  artist: String,
  filePath: String,
  imagePath: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("songs", songSchema, "songs");
