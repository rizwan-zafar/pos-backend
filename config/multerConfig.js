// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "upload");
//   },
//   filename: function (req, file, cb) {
//     console.log(">>>>>>>>>>>>>>. file  ", file);
//     const originalFileName = file.originalname;
//     const fileExtension = path.extname(originalFileName);
//     const newFileName = `${Date.now()}${fileExtension}`;
//     cb(null, newFileName);
//     // cb(null, file.originalname + "-" + Date.now() + ".jpg");
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;



const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const originalFileName = file.originalname;
    const fileExtension = path.extname(originalFileName);
    const newFileName = `${Date.now()}${fileExtension}`;
    cb(null, newFileName);
  },
});

// File filter for type validation
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|docx|mp4|avi|mkv/; // Added video types
  const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedFileTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Invalid file type. Only images, documents, and videos are allowed."), false); // Reject file
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 }, // 50 MB file size limit for videos
});

module.exports = upload;
