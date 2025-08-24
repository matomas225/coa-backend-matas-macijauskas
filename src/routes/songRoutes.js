const express = require("express");
const router = express.Router();
const { handleSongUpload, getSongs, getImage, streamSong, getUserSongs, deleteSong, updateSong, getSong } = require("../controllers/songController");
const { authMiddleware } = require("../middleware/authenticateJwt");
const { uploadFiles, handleMulterError } = require('../middleware/uploadMiddleware');
const { songUploadValidationRules } = require('../validation/songValidation');

router.get("/", getSongs);

router.get("/image/:filename", getImage);

router.get("/stream/:filename", authMiddleware, streamSong);

router.get("/song/:id", authMiddleware, getSong);

router.get("/user-songs", authMiddleware, getUserSongs);

router.delete("/user-songs/:id", authMiddleware, deleteSong);

router.patch(
  "/user-songs/:id", 
  authMiddleware, 
  uploadFiles,
  handleMulterError,
  songUploadValidationRules,
  updateSong
);

router.post(
  '/upload',
  authMiddleware,
  uploadFiles,
  handleMulterError,
  songUploadValidationRules,
  handleSongUpload
);

module.exports = router;
