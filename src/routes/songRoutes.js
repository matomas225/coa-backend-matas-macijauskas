const express = require("express");
const router = express.Router();
const musicController = require("../controllers/songController");
const { authMiddleware } = require("../middleware/authenticateJwt");
const { uploadFiles, handleMulterError } = require('../middleware/uploadMiddleware');
const { songUploadValidationRules } = require('../validation/songValidation');

router.get("/", musicController.getSongs);

router.get("/image/:filename", musicController.getImage);

router.get("/stream/:filename", authMiddleware, musicController.streamSong);

router.post(
  '/upload',
  uploadFiles,
  handleMulterError,
  songUploadValidationRules,
  musicController.uploadSong
);

module.exports = router;
