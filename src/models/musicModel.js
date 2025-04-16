const mongoose = require("mongoose");

//FOR SAVING SONG INFORMATION TO DB WILL USE LATER
const musicSchema = mongoose.Schema({});

module.exports = mongoose.model("songs", musicSchema);
