const express = require("express");
const router = express.Router();
const musicController = require("../controllers/songController");
const { authMiddleware } = require("../middleware/authenticateJwt");

router.get("/", musicController.getSongs);

router.get("/image/:filename", musicController.getImage);

router.get("/stream/:filename", authMiddleware, musicController.streamSong);

router.post("/upload", musicController.uploadSong);

module.exports = router;
