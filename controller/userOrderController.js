require("dotenv").config();

const mongoose = require("mongoose");

const Order = require("../models/Order");
const {
  handleProductQuantity,
  formatAmountForStripe,
} = require("../config/others");
const { Op } = require("sequelize");
const Product = require("../models/Product");
const sequelize = require("../config/db");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { sendEmail, sendOrderEmail } = require("../config/auth");


const addOrder = async (orderData) => {
  const { userId, items, totalPrice, sessionId } = orderData;

  //  Check if order already exists with this sessionId
  const existingOrder = await Order.findOne({ where: { sessionId } });
  if (existingOrder) {
    console.log("Order already exists for session:", sessionId);
    return existingOrder;
  }
  // Fetch user
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.address || !user.phone) {
    throw new Error(
      "User address and phone number are required before placing an order."
    );
  }

  const transaction = await sequelize.transaction();

  try {
    for (const item of JSON.parse(items)) {
      const product = await Product.findOne({
        where: { id: item.productId },
        transaction,
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const productVariations = JSON.parse(product.variations || "[]");

      if (productVariations.length > 0) {
        const selectedVariation =
          typeof item.selectedVariation === "string"
            ? productVariations.find((v) => v.size === item.selectedVariation)
            : productVariations.find(
                (v) => v.size === item.selectedVariation?.size
              );

        if (!selectedVariation || selectedVariation.stock < item.quantity) {
          throw new Error(
            `Not enough stock for product ID ${item.productId} and variation ${item.selectedVariation?.size}`
          );
        }

        selectedVariation.stock -= item.quantity;

        await Product.update(
          { variations: productVariations },
          { where: { id: item.productId }, transaction }
        );
      } else {
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ID ${item.productId}`);
        }

        await Product.update(
          { stock: product.stock - item.quantity },
          { where: { id: item.productId }, transaction }
        );
      }
    }

    // Save order
    const order = await Order.create(orderData, { transaction });
    console.log("Order created successfully");

    // Send emails
    const admins = await Admin.findAll(); 

    const userEmailBody = {
      from: `"Lidrah Orders" <${process.env.EMAIL_ORDER}>`,
      to: user.email,
      subject: "Order Confirmation - Your Order is Placed!",
      html: ` <div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
  <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:linear-gradient(41,29,26,41,29,26 30%,178,103,75 105%,51,51,51 65%);">
    
    <!-- Header -->
    <div style="text-align:center;padding:40px 20px 20px;">
      <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
      <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
    </div>

    <!-- Hero -->
    <div style="background:rgba(0,0,0,0.5);padding:60px 20px;text-align:center;">
      <h1 style="font-size:32px;margin:0;color:rgb(178,103,75);">Order Confirmation</h1>
      <h2 style="font-size:20px;margin:10px 0 0;color:#ffffff;">Hi ${user.name || "Customer"},</h2>
    </div>

    <!-- Content -->
    <div style="background-color:rgba(0,0,0,0.4);padding:40px 20px;text-align:center;">
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        Thank you for your purchase! We're excited to start crafting your order.
      </p>

      <div style="font-size:16px;color:#ffffff;margin-top:30px;text-align:left;max-width:550px;margin-left:auto;margin-right:auto;">
        <p><strong>Order ID:</strong> #ON${order.id}</p>
        <p><strong>Total Price:</strong>$${totalPrice}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toDateString()}</p>
      </div>

      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin-top:30px;">
        You will receive another email when your order is shipped. For any questions, feel free to contact us.
      </p>


       <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
      <p>Need help? Reach us at 
        <a href="mailto:support@lidrah.com" style="color:wheat;font-weight:bold;text-decoration:none;">support@lidrah.com</a>.
      </p>
      <p style="margin-top:30px;">Thank you,</p>
      <strong style="color:#fff;">The Lidrah Team</strong>
    </div>

    </div>

    <!-- Divider -->
    <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>
 <!-- About -->
    <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
      <p><strong>Why Lidrah?</strong><br>
        We craft premium leather goods that are elegant, enduring, and unmistakably yours. Our materials are ethically sourced and handcrafted to perfection. Be part of the journey.</p>
    </div>
    <!-- Footer -->
   
    <div style="background-color:rgba(41,29,26,0.9);color:#aaa;text-align:center;padding:30px 20px;font-size:13px;">
      <p style="margin:0 0 20px;color:#d1b8a3;font-size:14px;">
        &copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.
      </p>
      <p style="margin:0 0 20px;">
        <a href="https://www.lidrah.com" style="color:wheat;text-decoration:none;margin:0 12px;">Visit Store</a>|
        <a href="https://www.lidrah.com/privacy" style="color:wheat;text-decoration:none;margin:0 12px;">Privacy Policy</a>|
        <a href="https://www.lidrah.com/contact-us" style="color:wheat;text-decoration:none;margin:0 12px;">Contact Us</a>
      </p>
    </div>

  </div>
</div>
`,
    };
    sendOrderEmail(userEmailBody);

    for (const admin of admins) {
      const adminEmailBody = {
        from: `"Lidrah Orders" <${process.env.EMAIL_ORDER}>`,
        to: admin.email,
        subject: "New Order Placed",
        html: `<div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
  <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:linear-gradient(41,29,26,41,29,26 30%,178,103,75 105%,51,51,51 65%);">

    <!-- Header -->
    <div style="text-align:center;padding:40px 20px 20px;">
      <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
      <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
    </div>

    <!-- Hero -->
    <div style="background:rgba(0,0,0,0.5);padding:60px 20px;text-align:center;">
      <h1 style="font-size:30px;margin:0;color:rgb(178,103,75);">New Order Placed</h1>
      <h2 style="font-size:20px;margin:10px 0 0;color:#ffffff;">Hello ${admin.name},</h2>
    </div>

    <!-- Content -->
    <div style="background-color:rgba(0,0,0,0.4);padding:40px 20px;text-align:center;">
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        A new order has been placed. Below are the details:
      </p>

      <div style="font-size:16px;color:#ffffff;margin-top:30px;text-align:left;max-width:550px;margin-left:auto;margin-right:auto;">
        <p><strong>Order ID:</strong> #ON${order.id}</p>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Total Price:</strong>$ ${totalPrice}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toDateString()}</p>
      </div>

      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin-top:30px;">
        Please check the admin panel for full order details.
      </p>
    </div>

    <!-- Divider -->
    <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>

    <!-- About -->
    <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
      <p><strong>Why Lidrah?</strong><br>
        We craft premium leather goods that are elegant, enduring, and unmistakably yours. Our materials are ethically sourced and handcrafted to perfection. Be part of the journey.</p>
    </div>

    <!-- Footer Bar -->
    <div style="background-color:rgba(41,29,26,0.9);color:#aaa;text-align:center;padding:30px 20px;font-size:13px;">
      <p style="margin:0 0 20px;color:#d1b8a3;font-size:14px;">
        &copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.
      </p>
      <p style="margin:0 0 20px;">
        <a href="https://www.lidrah.com" style="color:wheat;text-decoration:none;margin:0 12px;">Visit Store</a>|
        <a href="https://www.lidrah.com/privacy" style="color:wheat;text-decoration:none;margin:0 12px;">Privacy Policy</a>|
        <a href="https://www.lidrah.com/contact-us" style="color:wheat;text-decoration:none;margin:0 12px;">Contact Us</a>
      </p>
    </div>

  </div>
</div>
`,
      };
      sendOrderEmail(adminEmailBody);
    }

    await transaction.commit();
    return order;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const getOrderByUser = async (req, res) => {
  // console.log(req.user._id);

  try {
    const { page, limit } = req.query;

    const currentPage = Number(page) || 1;
    const pageSize = Number(limit) || 8;
    const offset = (currentPage - 1) * pageSize;

    // Count total documents
    const totalDoc = await Order.count({
      where: { user: req.user._id },
    });

    // total pending orders
    const totalPendingOrder = await Order.findAndCountAll({
      where: { status: "Pending", user: req.user._id },
    });

    // total processing orders
    const totalProcessingOrder = await Order.findAndCountAll({
      where: { status: "Processing", user: req.user._id },
    });

    // total delivered orders
    const totalDeliveredOrder = await Order.findAndCountAll({
      where: { status: "Delivered", user: req.user._id },
    });

    // console.log(totalDeliveredOrder);

    // Fetch orders
    const orders = await Order.findAll({
      where: { user: req.user._id },
      order: [["createdAt", "DESC"]],
      offset,
      limit: pageSize,
    });

    res.send({
      orders,
      limits: pageSize,
      pages: currentPage,
      pending: totalPendingOrder.count,
      processing: totalProcessingOrder.count,
      delivered: totalDeliveredOrder.count,
      totalDoc,
    });
  } catch (err) {
    // console.error('Error fetching orders:', err);
    res.status(500).send({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }
    res.send(order);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  addOrder,
  getOrderById,
  getOrderByUser,
  // createPaymentIntent,
};
