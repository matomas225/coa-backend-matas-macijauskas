const mongoose = require("mongoose");

const albumSchema = mongoose.Schema({
  title: String,
  artist: String,
  coverImagePath: String, // store image path
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "songs" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("albums", albumSchema, "albums");
