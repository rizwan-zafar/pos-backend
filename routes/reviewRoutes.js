const express = require("express");
const router = express.Router();
const { addReview, getAllReviews, updateStatus, deleteReview, getReviewsByProductId } = require("../controller/ReviewController");

router.post("/add", addReview);
router.get("/", getAllReviews);
router.get('/:productId', getReviewsByProductId);
router.put('/status/:id', updateStatus);
router.delete("/:id", deleteReview);

module.exports = router;
