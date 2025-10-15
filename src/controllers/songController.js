const fs = require("fs");
const path = require("path");
const Song = require("../models/songModel");
const { validationResult } = require("express-validator");
const {
  uploadSong,
  updateSongFiles,
  formatSongResponse,
} = require("../services/songService");
const User = require("../models/userModel");

const handleSongUpload = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if files are present
    if (!req.files?.songFile?.[0] || !req.files?.imageFile?.[0]) {
      return res.status(400).json({
        errors: [
          {
            msg: !req.files?.songFile?.[0]
              ? "Song file is required"
              : "Cover image is required",
          },
        ],
      });
    }

    // Process upload through service
    const songMetadata = await uploadSong(req.body, {
      songFile: req.files.songFile[0],
      imageFile: req.files.imageFile[0],
    });

    // Save to database
    const newSong = new Song({
      title: songMetadata.title,
      artist: songMetadata.artist,
      album: songMetadata.album,
      filePath: songMetadata.filePath,
      imagePath: songMetadata.imagePath,
      owner: req.user.id,
    });

    const savedSong = await newSong.save();

    // Find user and update their ownedSongs
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { ownedSongs: savedSong._id } },
      { new: true },
    );

    res.status(201).json({
      message: "Song uploaded successfully",
      data: songMetadata,
    });
  } catch (error) {
    console.error("Error uploading song:", error);
    res.status(500).json({
      error: "Failed to upload song",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getSongs = async (req, res) => {
  try {
    const songsFromDb = await Song.find();

    const songs = songsFromDb.map((song) => ({
      songPath: `${process.env.BASE_URL}/songs/stream/${encodeURIComponent(
        path.basename(song.filePath),
      )}`,
      imagePath: `${process.env.BASE_URL}/songs/image/${encodeURIComponent(
        path.basename(song.imagePath),
      )}`,
      title: song.title,
      artist: song.artist,
      id: song.id,
    }));

    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Error fetching songs" });
  }
};

const streamSong = async (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "..", "uploads", "songs", fileName);

  try {
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, { "Content-Type": "audio/mpeg" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB per chunk
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : start + CHUNK_SIZE - 1;

    if (start >= fileSize) {
      return res.status(416).send("Requested range not satisfiable");
    }

    const finalEnd = Math.min(end, fileSize - 1);
    const chunkSize = finalEnd - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${finalEnd}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    });

    fs.createReadStream(filePath, { start, end: finalEnd }).pipe(res);
  } catch (error) {
    console.error("Error streaming song:", error);
    res.status(404).send("File not found");
  }
};

const getImage = async (req, res) => {
  const fileName = req.params.filename;
  const imagePath = path.join(__dirname, "..", "uploads", "images", fileName);

  try {
    await fs.promises.access(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    res.status(404).send("Image not found");
  }
};

const getUserSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const songs = await Song.find({ _id: { $in: user.ownedSongs } });
    const songsWithPaths = songs.map((song) => ({
      id: song._id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      owner: song.owner,
      createdAt: song.createdAt,
      songPath: `${process.env.BASE_URL}/songs/stream/${encodeURIComponent(
        path.basename(song.filePath),
      )}`,
      imagePath: `${process.env.BASE_URL}/songs/image/${encodeURIComponent(
        path.basename(song.imagePath),
      )}`,
    }));
    res.status(200).json(songsWithPaths);
  } catch (error) {
    console.error("Error fetching user songs:", error);
    res.status(500).json({ error: "Error fetching user songs" });
  }
};

deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Delete the song document
    await Song.findByIdAndDelete(req.params.id);

    // Also remove the song reference from the owner's ownedSongs
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { ownedSongs: req.params.id } },
      { new: true },
    );

    // NEW: Remove the song id from all albums that contain it
    const Album = require("../models/albumModel");
    await Album.updateMany({ songs: song._id }, { $pull: { songs: song._id } });

    // Delete files from disk
    await fs.promises.unlink(
      path.join(
        __dirname,
        "..",
        "uploads",
        "songs",
        path.basename(song.filePath),
      ),
    );
    await fs.promises.unlink(
      path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        path.basename(song.imagePath),
      ),
    );

    res
      .status(200)
      .json({ message: "Song deleted successfully", id: song._id });
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ error: "Error deleting song" });
  }
};

const updateSong = async (req, res) => {
  try {
    // Check if song exists
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check if this is the song owner
    if (song.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this song" });
    }

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Handle file updates and get update data
    const updateData = await updateSongFiles(req.body, req.files || {}, song);

    // Update song in database
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    res.status(200).json({
      message: "Song updated successfully",
      data: formatSongResponse(updatedSong),
    });
  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({ error: "Error updating song" });
  }
};

const getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.status(200).json(formatSongResponse(song));
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ error: "Error fetching song" });
  }
};

module.exports = {
  handleSongUpload,
  getUserSongs,
  getSongs,
  streamSong,
  getImage,
  deleteSong,
  updateSong,
  getSong,
};
