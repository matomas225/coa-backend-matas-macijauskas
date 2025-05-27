const path = require('path');
const fs = require('fs').promises;

// Constants for paths
const UPLOAD_DIRS = {
  songs: path.join(__dirname, '../uploads/songs'),
  images: path.join(__dirname, '../uploads/images')
};

// Initialize upload directories
const initializeDirectories = async () => {
  try {
    await Promise.all([
      fs.mkdir(UPLOAD_DIRS.songs, { recursive: true }),
      fs.mkdir(UPLOAD_DIRS.images, { recursive: true })
    ]);
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
};

// Initialize directories when the service is first loaded
initializeDirectories();

// Helper function to generate unique filename
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const extension = path.extname(originalFilename);
  return `${timestamp}${extension}`;
};

// Helper function to clean up files in case of error
const cleanupFiles = async (files) => {
  if (files.songFile?.path) {
    await fs.unlink(files.songFile.path).catch(console.error);
  }
  if (files.imageFile?.path) {
    await fs.unlink(files.imageFile.path).catch(console.error);
  }
};

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
      songPath: path.join('uploads', 'songs', songFileName),
      imagePath: path.join('uploads', 'images', imageFileName),
      createdAt: new Date(),
    };
  } catch (error) {
    await cleanupFiles(files);
    throw error;
  }
};

module.exports = {
  uploadSong
}; 