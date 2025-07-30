const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  getAllBanners,
  updateStatus,
  updateBanner,
  deleteBanner,
  getBannerById,
} = require("../../controller/settings/videoBannerController");

router.post("/", uploadVideo);

// Get all banners
router.get("/", getAllBanners);

router.put("/status/:id", updateStatus);

// Get single banner by ID
router.get("/:id", getBannerById);

// Update banner
router.put("/:id", updateBanner);

// Delete banner
router.delete("/:id", deleteBanner);

module.exports = router;
