const express = require("express");
const router = express.Router();
const musicController = require("../controllers/musicController");

router.get("/", musicController.getSongs);

router.get("/stream/:filename", musicController.streamSong);

router.post("/upload", musicController.uploadSong);

module.exports = router;
