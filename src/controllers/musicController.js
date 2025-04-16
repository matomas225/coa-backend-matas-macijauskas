const fs = require("fs");
const path = require("path");

const getSongs = (req, res) => {
  const songs = ["Fall Back.mp3", "Hold Out.mp3"];

  const songUrls = songs.map((song) => {
    return `http://localhost:3000/songs/stream/${encodeURIComponent(song)}`;
  });

  res.json(songUrls);
};

//I DON'T KNOW 100% HOW IT WORKS TALK WITH CODEACADEMY TEACHERS!!!!
// Default chunk size - You can change this to adjust streaming behavior
const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB per chunk

const streamSong = (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "..", "uploads", "music", fileName); // Construct the file path

  // Check if the file exists
  fs.stat(filePath, (err, stat) => {
    if (err) {
      return res.status(404).send("File not found"); // If the file isn't found, return 404
    }

    const fileSize = stat.size; // Get the total size of the file
    const range = req.headers.range; // Get the range from the request

    // If no Range header is sent, we send the whole file
    if (!range) {
      res.writeHead(200, { "Content-Type": "audio/mpeg" }); // HTTP 200 OK for the whole file
      fs.createReadStream(filePath).pipe(res); // Send the entire file
      return;
    }

    // Parsing the Range header (e.g., bytes=0-1048575)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10); // Start byte
    const end = parts[1] ? parseInt(parts[1], 10) : start + CHUNK_SIZE - 1; // End byte (default to chunk size)

    // Ensure that the requested range is valid
    if (start >= fileSize) {
      return res.status(416).send("Requested range not satisfiable"); // 416 if the range is out of bounds
    }

    const finalEnd = end > fileSize - 1 ? fileSize - 1 : end; // Don't exceed file size
    const chunkSize = finalEnd - start + 1; // Calculate the actual chunk size

    // Send the appropriate response headers (206 Partial Content)
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${finalEnd}/${fileSize}`, // Indicate which part of the file is being sent
      "Accept-Ranges": "bytes", // Inform the client that byte-range requests are supported
      "Content-Length": chunkSize, // Indicate the size of the chunk being sent
      "Content-Type": "audio/mpeg", // Specify the MIME type
    });

    // Create a stream for the requested chunk and send it to the response
    fs.createReadStream(filePath, { start, end: finalEnd }).pipe(res);
  });
};

module.exports = {
  getSongs,
  streamSong,
};
