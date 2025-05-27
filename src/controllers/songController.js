const fs = require("fs");
const path = require("path");
const Song = require("../models/songModel");
const { validationResult } = require('express-validator');
const { uploadSong } = require('../services/songService');

class SongController {
  async uploadSong(req, res) {
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
                ? 'Song file is required'
                : 'Cover image is required'
            }
          ]
        });
      }

      // Process upload through service
      const songMetadata = await uploadSong(req.body, {
        songFile: req.files.songFile[0],
        imageFile: req.files.imageFile[0]
      });
      
      // Save to database
      const newSong = new Song({
        title: songMetadata.title,
        artist: songMetadata.artist,
        album: songMetadata.album,
        filePath: songMetadata.songPath,
        imagePath: songMetadata.imagePath
      });

      await newSong.save();
      
      res.status(201).json({
        message: 'Song uploaded successfully',
        data: songMetadata
      });
    } catch (error) {
      console.error('Error uploading song:', error);
      res.status(500).json({
        error: 'Failed to upload song',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getSongs(req, res) {
    try {
      const songsFromDb = await Song.find();
  
      const songs = songsFromDb.map((song) => ({
        songPath: `http://localhost:3000/songs/stream/${encodeURIComponent(
          path.basename(song.filePath)
        )}`,
        imagePath: `http://localhost:3000/songs/image/${encodeURIComponent(
          path.basename(song.imagePath)
        )}`,
        title: song.title,
        artist: song.artist,
        id: song.id,
      }));
  
      res.json(songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
      res.status(500).json({ error: 'Error fetching songs' });
    }
  }

  async streamSong(req, res) {
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
      console.error('Error streaming song:', error);
      res.status(404).send("File not found");
    }
  }

  async getImage(req, res) {
    const fileName = req.params.filename;
    const imagePath = path.join(__dirname, "..", "uploads", "images", fileName);
  
    try {
      await fs.promises.access(imagePath);
      res.sendFile(imagePath);
    } catch (error) {
      res.status(404).send("Image not found");
    }
  }
}

module.exports = new SongController();
