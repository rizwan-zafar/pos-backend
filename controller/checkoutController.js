const createCheckoutSession = async (req, res) => {
  // Determine Stripe key based on request origin
  const origin = req.headers.origin || req.headers.referer || '';
  let stripeKey;
  if (origin.includes('vercel.app') || origin.includes('localhost')) {
    stripeKey = process.env.STRIPE_KEY_TEST;
  } else {
    stripeKey = process.env.STRIPE_KEY;
  }
  const stripe = require("stripe")(stripeKey);

  // const { items, userId, totalPrice, address } = req.body;
  const {
    userId,
    items,
    reciever_name,
    reciever_address,
    reciever_contact,
    totalPrice,
  } = req.body;

  if (
    !userId ||
    !items ||
    !reciever_name ||
    !reciever_address ||
    !reciever_contact ||
    !totalPrice
  ) {
    throw new Error("Missing required fields");
  }

  try {
    const lineItems = [];

    items.forEach((item) => {
      // Add the product item
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      });

      // // Add delivery if applicable
      if (item.delivery && item.delivery > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Delivery for ${item.title}`,
            },
            unit_amount: Math.round(item.delivery * 100),
          },
          quantity: 1,
        });
      }
    });


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
                success_url: `${process.env.STORE_URL}/complete-order?oid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STORE_URL}/cancel`,
      billing_address_collection: "required",
      metadata: {
        userId,
        items: JSON.stringify(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedVariation: item.selectedVariation || "",
            delivery: item?.delivery || 0,
          }))
        ),
        reciever_name: reciever_name,
        reciever_contact: reciever_contact,
        reciever_address: reciever_address,
        totalPrice: totalPrice.toString(),
      },
    });

    res.send({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};


module.exports = {
  createCheckoutSession,
  // handleWebhook,
};
