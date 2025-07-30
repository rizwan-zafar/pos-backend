const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const visualSearchController = require('../controller/visualSearchController');

// Ensure /upload/visualsearch exists and is writable
const visualSearchFolder = path.join(__dirname, '../upload/visualsearch');
try {
  if (!fs.existsSync(visualSearchFolder)) {
    fs.mkdirSync(visualSearchFolder, { recursive: true });
    console.log('Created folder:', visualSearchFolder);
  }
  fs.accessSync(visualSearchFolder, fs.constants.W_OK);
} catch (err) {
  console.error('Cannot access or create visualsearch folder:', err.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, visualSearchFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/visual-search
router.post('/', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    console.error('No file uploaded!');
    return res.status(400).json({ error: 'No image uploaded' });
  }
  console.log('Uploaded file:', req.file.path);
  next();
}, visualSearchController.visualSearch);

module.exports = router; 