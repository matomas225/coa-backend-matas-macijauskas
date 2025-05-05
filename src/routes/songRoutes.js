const express = require("express");
const router = express.Router();
const musicController = require("../controllers/songController");

router.get("/", musicController.getSongs);

router.get("/image/:filename", musicController.getImage);

router.get("/stream/:filename", musicController.streamSong);

router.post("/upload", musicController.uploadSong);

module.exports = router;
