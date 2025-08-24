const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authenticateJwt");
const albumController = require("../controllers/albumController");
const {uploadAlbumCover} = require("../middleware/uploadMiddleware");
const {
    albumCreateValidationRules,
    albumAddSongValidationRules,
} = require("../validation/albumValidation");

router.get("/cover/:filename", albumController.getAlbumCover);
router.post(
    "/create",
    authMiddleware,
    uploadAlbumCover.single("coverImage"),
    albumCreateValidationRules,
    albumController.createAlbum
);
router.post(
    "/add-song",
    authMiddleware,
    albumAddSongValidationRules,
    albumController.addSongToAlbum
);

router.post('/remove-song', authMiddleware, albumController.removeSongFromAlbum)

router.get("/", authMiddleware, albumController.getAlbums);

module.exports = router;
