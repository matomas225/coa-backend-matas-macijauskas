const multer = require('multer');
const path = require('path');

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'songFile') {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  } else if (file.fieldname === 'imageFile') {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'temp'));
  },
  filename: function (req, file, cb) {
    // Generate unique filename with extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter
});

// Middleware for handling file uploads
const uploadFiles = upload.fields([
  { name: 'songFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      error: 'Invalid file',
      message: err.message
    });
  }
  next();
};

module.exports = {
  uploadFiles,
  handleMulterError
}; 