const express = require("express");
const router = express.Router();
const bannerController = require("../../controller/settings/bannerController");

// Create banner
router.post("/", bannerController.createBanner);

// Get all banners
router.get("/", bannerController.getAllBanners);

// Update status
router.put('/status/:id', bannerController.updateStatus);


// Get single banner by ID
router.get("/:id", bannerController.getBannerById);

// Update banner
router.put("/:id", bannerController.updateBanner);

// Delete banner
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
