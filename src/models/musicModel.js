const mongoose = require("mongoose");

const musicSchema = mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("music", musicSchema, "music");
