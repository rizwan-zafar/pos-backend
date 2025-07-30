const express = require("express");
const router = express.Router();
const AppPromotionController = require("../../controller/settings/AppPromotionController");

// Create promo banner
router.post("/", AppPromotionController.createAppPromoBanner);

// Get all promo banners
router.get("/", AppPromotionController.getAllAppPromoBanners);

// Update status
router.put('/status/:id', AppPromotionController.updateStatus);


// Get single promo banner by ID
router.get("/:id", AppPromotionController.getPromoBannerById);

// Update promo banner
router.put("/:id", AppPromotionController.updatePromoBanner);

// Delete promo banner
router.delete("/:id", AppPromotionController.deletePromoBanner);

module.exports = router;
