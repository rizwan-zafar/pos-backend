const express = require("express");
const checkoutController = require("../controller/checkoutController");
const router = express.Router();

router.post("/checkout-session", checkoutController.createCheckoutSession);
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   checkoutController.handleWebhook
// );

module.exports = router;
