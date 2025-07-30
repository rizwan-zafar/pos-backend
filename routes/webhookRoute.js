// routes/webhook.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { addOrder } = require("../controller/userOrderController");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // Determine Stripe key based on request origin
    const origin = req.headers.origin || req.headers.referer || '';
    let stripeKey;
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      stripeKey = process.env.STRIPE_KEY_TEST;
    } else {
      stripeKey = process.env.STRIPE_KEY;
    }
    const stripe = require("stripe")(stripeKey);

    let endpointSecret;
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;
    } else {
      endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }

    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Webhook received: checkout.session.completed");

      const newOrder = {
        userId: session.metadata.userId,
        items: session.metadata.items,
        totalPrice: session.metadata.totalPrice,
        paymentMethod: "Stripe",
        status: "Pending",
        reciever_name: session.metadata.reciever_name,
        reciever_address: session.metadata.reciever_address,
        billing_address: JSON.stringify(session.customer_details),
        reciever_contact: session.metadata.reciever_contact,
        sessionId: session.id,
      };
      console.log(">>>>>>>>> : ", "webhooks");

      try {
        await addOrder(newOrder);
        return res.status(200).send("Order saved");
      } catch (err) {
        console.error("Order DB save failed", err);
        return res.status(500).send("Order save failed");
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
