require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const fs = require("fs");

// const path = require("path"//);

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userOrderRoutes = require("./routes/userOrderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const CheckoutRoutes = require("./routes/checkoutRoutes");
// const couponRoutes = require('../routes/couponRoutes');
const faqsRoutes = require("./routes/faqRoutes");
const bannerRoutes = require("./routes/settings/bannerRoutes");
const videoBannerRoutes = require("./routes/settings/videoBannerRoutes");
const promoBannerRoutes = require("./routes/settings/promoBannerRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const visualSearchRoutes = require("./routes/visualSearchRoutes");
const { isAuth, isAdmin } = require("./config/auth");
// Connect to the database

connectDB
  .sync()
  .then(() => {
    console.log("Database connected!");
  })
  .catch((err) => {
    console.log("Database connection failed!", err.message);
  });

const app = express();
// app.use(cors({
//   origin: 'http://localhost:4000', // Frontend URL
//   methods: ['GET', 'POST']
// }));

// We are using this for the express-rate-limit middleware
// See: https://github.com/nfriedly/express-rate-limit
// app.enable('trust proxy');
app.set("trust proxy", 1);

// app.use(
//   // "/webhook",
//   "/api/webhook",
//   express.raw({ type: "application/json" }),
//   CheckoutRoutes
// );


app.use("/", require("./routes/checkoutRoutes"));
app.use("/api/webhook", require("./routes/webhookRoute")); // Note: express.raw middleware required


app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors());




//root route
app.get("/", (req, res) => {
  res.send("App works properly!");
});

//this for route will need for store front, also for admin dashboard
app.use("/api/products/", productRoutes);
app.use("/api/faqs/", faqsRoutes);
app.use("/api/category/", categoryRoutes);
app.use("/api", CheckoutRoutes)
// app.use('/api/coupon/', couponRoutes);
app.use("/api/user/", userRoutes);
app.use("/api/order/", isAuth, userOrderRoutes);
// app.use("/api/reviews/", isAuth, reviewRoutes);
app.use("/api/reviews/", reviewRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/videobanners", videoBannerRoutes);

app.use("/api/promo-banners", promoBannerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/visual-search", visualSearchRoutes);

//if you not use admin dashboard then these two route will not needed.
app.use("/api/admin/", adminRoutes);
app.use("/api/orders/", isAuth, orderRoutes);

// Use express's default error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ message: err.message });
});


// Ensure the base upload directories exist
const basePath = "./upload";
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath);
}
// if (!fs.existsSync(`${basePath}/images`)) {
//   fs.mkdirSync(`${basePath}/images`);
// }
if (!fs.existsSync(`${basePath}/videos`)) {
  fs.mkdirSync(`${basePath}/videos`);
}

// Set up storage engine with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check file type and set directory
    if (file.mimetype.startsWith("image")) {
      cb(null, basePath);
    } else if (file.mimetype.startsWith("video")) {
      cb(null, `${basePath}/videos`);
    } else {
      cb(
        new Error("Invalid file type. Only images and videos are allowed."),
        null
      );
    }
  },
  filename: function (req, file, cb) {
    const newFileName = `${Date.now()}-${file.originalname}`;
    cb(null, newFileName);
  },
});

// Initialize upload variable for multiple files
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 }, // 100 MB file size limit
}).array("file", 5); // Maximum 10 files allowed

// Express route for file upload
app.post(process.env.UPLOAD_ENDPOINT, upload, async (req, res) => {
  if (req.files && req.files.length > 0) {
    const uploadedFiles = req.files.map((file) => {
      const fileUrl = `${req.protocol}://${req.get("host")}/upload/${
        file.mimetype.startsWith("image") ? "" : "videos"
      }/${file.filename}`;
      return fileUrl;
    });

    console.log("Uploaded Files: ", uploadedFiles);
    // res.send({
    //   files: req.files.map((file) => file.filename),
    //   message: "Files uploaded successfully",
    //   urls: uploadedFiles,
    // });

    res.send({
      files: req.files.map((file) => file.filename),
      message: "Images uploaded successfully",
      images: uploadedFiles,
    });
  } else {
    res.status(400).send("No files uploaded.");
  }
});

// Serve static files from the 'upload' directory
app.use("/upload", express.static("upload"));





const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`server running on port ${PORT}`));

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
