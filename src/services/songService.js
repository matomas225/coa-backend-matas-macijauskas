const fs = require('fs').promises;
const path = require('path');

// Constants for upload directories
const UPLOAD_DIRS = {
  songs: path.join(__dirname, '..', 'uploads', 'songs'),
  images: path.join(__dirname, '..', 'uploads', 'images'),
  temp: path.join(__dirname, '..', 'temp')
};

// Ensure upload directories exist
const initializeUploadDirs = async () => {
  for (const dir of Object.values(UPLOAD_DIRS)) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

// Initialize directories
initializeUploadDirs().catch(console.error);

// Generate unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const ext = path.extname(originalname);
  return `${timestamp}${ext}`;
};

// Clean up temporary files
const cleanupFiles = async (files) => {
  const fileArray = [];
  if (files.songFile?.[0]) fileArray.push(files.songFile[0]);
  if (files.imageFile?.[0]) fileArray.push(files.imageFile[0]);

  await Promise.all(
    fileArray.map(file => 
      fs.unlink(file.path).catch(() => {})
    )
  );
};

// Delete existing files
const deleteExistingFiles = async (paths) => {
  if (paths.songPath) {
    await fs.unlink(path.join(__dirname, '..', paths.songPath)).catch(() => {});
  }
  if (paths.imagePath) {
    await fs.unlink(path.join(__dirname, '..', paths.imagePath)).catch(() => {});
  }
};

// Helper function to format song response
const formatSongResponse = (song) => ({
  id: song._id,
  title: song.title,
  artist: song.artist,
  album: song.album,
  songPath: `http://localhost:3000/songs/stream/${encodeURIComponent(path.basename(song.filePath))}`,
  imagePath: `http://localhost:3000/songs/image/${encodeURIComponent(path.basename(song.imagePath))}`
});

// Main upload function
const uploadSong = async (songData, files) => {
  try {
    const { title, artist, album } = songData;
    const { songFile, imageFile } = files;

    const songFileName = generateUniqueFilename(songFile.originalname);
    const imageFileName = generateUniqueFilename(imageFile.originalname);

    // Move files from temp to permanent location
    await Promise.all([
      fs.rename(
        songFile.path,
        path.join(UPLOAD_DIRS.songs, songFileName)
      ),
      fs.rename(
        imageFile.path,
        path.join(UPLOAD_DIRS.images, imageFileName)
      )
    ]);

    // Return metadata for database storage
    return {
      title,
      artist,
      album: album || null,
      filePath: path.join('uploads', 'songs', songFileName),
      imagePath: path.join('uploads', 'images', imageFileName),
      createdAt: new Date(),
    };
  } catch (error) {
    await cleanupFiles(files);
    throw error;
  }
};

// Handle single file update
const handleSingleFileUpdate = async (file, type, oldFilePath) => {
  try {
    const fileName = generateUniqueFilename(file.originalname);
    const uploadDir = type === 'song' ? UPLOAD_DIRS.songs : UPLOAD_DIRS.images;
    const relativePath = path.join('uploads', type === 'song' ? 'songs' : 'images', fileName);

    // Move file from temp to permanent location
    await fs.rename(file.path, path.join(uploadDir, fileName));
    
    // Delete old file if it exists
    if (oldFilePath) {
      await fs.unlink(path.join(__dirname, '..', oldFilePath)).catch(() => {});
    }

    return relativePath;
  } catch (error) {
    // Clean up temp file if something goes wrong
    await fs.unlink(file.path).catch(() => {});
    throw error;
  }
};

// Update song files
const updateSongFiles = async (songData, files, existingSong) => {
  try {
    let updateData = { ...songData };

    if (files.songFile?.[0] && files.imageFile?.[0]) {
      // Both files are being updated
      const songMetadata = await uploadSong(songData, {
        songFile: files.songFile[0],
        imageFile: files.imageFile[0]
      });

      // Delete old files after successful upload
      await deleteExistingFiles({
        songPath: existingSong.filePath,
        imagePath: existingSong.imagePath
      });

      updateData = {
        ...updateData,
        filePath: songMetadata.filePath,
        imagePath: songMetadata.imagePath
      };
    } else {
      // Handle individual file updates
      if (files.songFile?.[0]) {
        updateData.filePath = await handleSingleFileUpdate(
          files.songFile[0],
          'song',
          existingSong.filePath
        );
      }
      if (files.imageFile?.[0]) {
        updateData.imagePath = await handleSingleFileUpdate(
          files.imageFile[0],
          'image',
          existingSong.imagePath
        );
      }
    }

    return updateData;
  } catch (error) {
    await cleanupFiles(files);
    throw error;
  }
};

module.exports = {
  uploadSong,
  updateSongFiles,
  formatSongResponse,
  deleteExistingFiles
}; 