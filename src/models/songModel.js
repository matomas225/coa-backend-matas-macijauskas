const mongoose = require("mongoose");

const songSchema = mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  filePath: String,
  imagePath: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("songs", songSchema, "songs");
