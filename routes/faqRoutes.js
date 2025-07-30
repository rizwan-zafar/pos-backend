const express = require("express");
const router = express.Router();
const {
  addFaqs,
  getAllFaqs,
  getFaqById,
  updateFaqById,
  deleteFaq,
} = require("../controller/FaqController");

//add a faqs
router.post("/add", addFaqs);
router.get("/all", getAllFaqs);
router.get("/get/:id", getFaqById);
router.put("/update/:id", updateFaqById);
router.delete("/delete/:id", deleteFaq);

module.exports = router;
