const dayjs = require("dayjs");
const Order = require("../models/Order");
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderEmail } = require("../config/auth");

const getAllOrders = async (req, res) => {
  const { status, page, limit } = req.query;

  let queryObject = {
    totalPrice: { [Op.gte]: 1 },
  };
  if (status && status !== "undefined") {
    queryObject.status = { [Op.like]: `%${status}%` };
  }

  const pages = Number(page) || 1;
  const limits = Number(limit) || 8;
  const offset = (pages - 1) * limits;

  try {
    const totalDoc = await Order.count({ where: queryObject });

    //  orders with user details
    const orders = await Order.findAll({
      where: queryObject,
      order: [["createdAt", "DESC"]],
      // offset: offset,
      // limit: limits,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "address", "phone"],
        },
      ],
    });
    // console.log('>>>>>>>>>>>> orders',totalDoc);

    // Parse items field and include product details
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        let items;
        try {
          items = JSON.parse(order?.items || "[]");
        } catch (err) {
          console.error("Failed to parse items:", err);
          items = [];
        }

        // const products = await Promise.all(
        //   items.map(async (item) => {
        //     const product = await Product.findByPk(item.productId);
        //     return {
        //       ...item,
        //       productDetails: product ? product.toJSON() : null,
        //     };
        //   })
        // );

        const products = await Promise.all(
          items.map(async (item) => {
            const product = await Product.findByPk(item.productId);

            let productDetails = null;

            if (product) {
              let gallery = "[]";
              try {
                const parsedGallery = JSON.parse(product.gallery || "[]");
                gallery = JSON.stringify(parsedGallery.reverse());
              } catch (err) {
                console.error(
                  "Error parsing gallery for productId:",
                  item.productId
                );
              }

              productDetails = {
                ...product.toJSON(),
                gallery, // reversed and stringified
              };
            }

            return {
              ...item,
              productDetails,
            };
          })
        );

        return {
          ...order.toJSON(),
          items: products,
        };
      })
    );

    res.send({
      orders: ordersWithProducts,
      // limits,
      pages,
      totalDoc,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getOrderByUser = async (req, res) => {
  console.log(req.params.id);
  try {
    const orders = await Order.findAll({
      where: {
        userId: req.params.id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "address", "phone"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        // Parse items field and include product details
        let items;
        try {
          items = JSON.parse(order.items);
        } catch (err) {
          console.error("Failed to parse items:", err);
          items = [];
        }

        // const products = await Promise.all(
        //   items.map(async (item) => {
        //     const product = await Product.findByPk(item.productId);
        //     return {
        //       ...item,
        //       productDetails: product ? product.toJSON() : null,
        //     };
        //   })
        // );

        const products = await Promise.all(
          items.map(async (item) => {
            const product = await Product.findByPk(item.productId);

            let productDetails = null;

            if (product) {
              const productObj = product.toJSON();
              try {
                const parsedGallery = JSON.parse(productObj.gallery || "[]");
                productObj.gallery = JSON.stringify(parsedGallery.reverse());
              } catch (err) {
                console.error(
                  "Error parsing gallery for productId:",
                  item.productId
                );
              }

              productDetails = productObj;
            }

            return {
              ...item,
              productDetails,
            };
          })
        );

        return {
          ...order.toJSON(),
          items: products,
        };
      })
    );

    res.send(ordersWithProducts);
  } catch (err) {
    console.error("Error fetching orders by user ID:", err);
    res.status(500).send({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "address", "phone"],
        },
      ],
    });

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    // Parse items field and include product details
    let items;
    try {
      items = JSON.parse(order.items);
    } catch (err) {
      console.error("Failed to parse items:", err);
      items = [];
    }

    // const products = await Promise.all(
    //   items.map(async (item) => {
    //     const product = await Product.findByPk(item.productId);
    //     return {
    //       ...item,
    //       productDetails: product ? product.toJSON() : null,
    //     };
    //   })
    // );

    const products = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findByPk(item.productId);

        if (!product) {
          return {
            ...item,
            productDetails: null,
          };
        }

        const productObj = product.toJSON();

        try {
          const parsedGallery = JSON.parse(productObj.gallery || "[]");
          productObj.gallery = JSON.stringify(parsedGallery.reverse());
        } catch (err) {
          console.error("Error parsing gallery for productId:", item.productId);
        }

        return {
          ...item,
          productDetails: productObj,
        };
      })
    );

    const orderWithProducts = {
      ...order.toJSON(),
      items: products,
    };

    res.send(orderWithProducts);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    res.status(500).send({ message: err.message });
  }
};
const getOrderBySessionId = async (req, res) => {
  console.log("session>>>>>>>>>>>>>>");

  try {
    const sessionId = req.params.id;

    const order = await Order.findOne({
      where: { sessionId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "address", "phone"],
        },
      ],
    });

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    // Parse items field and include product details
    let items = [];
    try {
      items = JSON.parse(order.items);
    } catch (err) {
      console.error("Failed to parse items:", err);
    }

    // const products = await Promise.all(
    //   items.map(async (item) => {
    //     const product = await Product.findByPk(item.productId);
    //     return {
    //       ...item,
    //       productDetails: product ? product.toJSON() : null,
    //     };
    //   })
    // );

    const products = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findByPk(item.productId);

        if (!product) {
          return {
            ...item,
            productDetails: null,
          };
        }

        const productObj = product.toJSON();

        try {
          const parsedGallery = JSON.parse(productObj.gallery || "[]");
          productObj.gallery = JSON.stringify(parsedGallery.reverse());
        } catch (err) {
          console.error("Error parsing gallery for productId:", item.productId);
        }

        return {
          ...item,
          productDetails: productObj,
        };
      })
    );

    const orderWithProducts = {
      ...order.toJSON(),
      items: products,
    };

    res.send(orderWithProducts);
  } catch (err) {
    console.error("Error fetching order by sessionId:", err);
    res.status(500).send({ message: err.message });
  }
};

///////////

const lidrahEmailWrapper = (userName, orderId, content) => `
  <div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
    <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.7);">
      
      <div style="text-align:center;padding:40px 20px 20px;">
        <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
        <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
      </div>

      <div style="padding:40px 20px;text-align:center;">
        <h2 style="font-size:24px;margin-bottom:10px;">Hello ${userName},</h2>
        <p style="font-size:16px;margin-bottom:5px;">Order ID: <strong>#ON${orderId}</strong></p>
        ${content}
      </div>

      <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>

      <div style="text-align:center;padding:20px;color:#ccc;font-size:13px;">
        <p>&copy; ${new Date().getFullYear()} <strong style="color:white;">Lidrah</strong>. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

const updateOrder = async (req, res) => {
  console.log("orderId", req.body.status);
  const newStatus = req.body.status;

  try {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }

      if (order.status === "Cancel" && newStatus === "Cancel") {
        return res.status(200).send({ message: "Order already canceled" });
      }

      if (newStatus === "Cancel" && order.status !== "Cancel") {
        const items = JSON.parse(order.items);
        for (const item of items) {
          const product = await Product.findOne({
            where: { id: item.productId },
            transaction,
          });
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          const updatedQuantity = product.stock + item.quantity;
          await Product.update(
            { stock: updatedQuantity },
            { where: { id: item.productId }, transaction }
          );

          console.log("Updated product quantity:", product.stock);
        }
      }

      await order.update({ status: newStatus }, { transaction });

      // Fetch user email
      const user = await User.findByPk(order.userId);
      if (!user) {
        throw new Error(`User with ID ${order.userId} not found`);
      }

      // Set email content based on status
      let emailSubject;
      let emailMessage;

      switch (newStatus) {
        case "Pending":
          emailSubject = "Your Order Has Been Received";
          emailMessage = lidrahEmailWrapper(
            user.name,
            order.id,
            `
  <p>Your order has been received and is currently in <strong>Pending</strong> status.</p>
  <p>We will notify you once we start processing it.</p>
  <p>Thank you for shopping with Lidrah!</p>
`
          );
          break;

        case "Processing":
          emailSubject = "Your Order is Now Being Processed";
          emailMessage = lidrahEmailWrapper(
            user.name,
            order.id,
            `
  <p>Good news! Your order is now <strong>Processing</strong>.</p>
  <p>Our team is preparing your items and will ship them soon.</p>
  <p>We’ll notify you when it’s on the way.</p>
`
          );

          break;

        case "Delivered":
          emailSubject = "Your Order Has Been Delivered";
          emailMessage = lidrahEmailWrapper(
            user.name,
            order.id,
            `
  <p>Your order has been <strong>Delivered</strong>.</p>
  <p>We hope you enjoy your purchase!</p>
  <p>Thank you for choosing Lidrah.</p>
`
          );

          break;

        case "Cancel":
          emailSubject = "Your Order Has Been Canceled";
          emailMessage = lidrahEmailWrapper(
            user.name,
            order.id,
            `
  <p>Your order has been <strong>Canceled</strong>.</p>
  <p>If this was a mistake, please contact our support team at <a href="mailto:support@lidrah.com" style="color:rgb(178,103,75);text-decoration:none;">support@lidrah.com</a>.</p>
`
          );

          break;

        default:
          emailSubject = "Order Status Update";
          emailMessage = `<p>Your order status has been updated to: <strong>${newStatus}</strong>.</p>`;
          break;
      }

      // Email body
      const emailBody = {
        from: `"Lidrah Orders" <${process.env.EMAIL_ORDER}>`,
        to: user.email,
        subject: emailSubject,
        html: `
          <h3>Order Status Updated</h3>
          <p><strong>Order ID:</strong> #ON${order.id}</p>
          ${emailMessage}
        `,
      };

      sendOrderEmail(emailBody);

      // Commit transaction
      await transaction.commit();
      res.status(200).send({ message: "Order Updated Successfully!" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).send({ message: error.message });
    }
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).send({ message: err.message });
  }
};
// const updateOrder = async (req, res) => {
//   console.log("orderId", req.body.status);
//   const newStatus = req.body.status;

//   try {
//     const transaction = await sequelize.transaction();
//     try {
//       const order = await Order.findByPk(req.params.id);
//       if (!order) {
//         return res.status(404).send({ message: "Order not found" });
//       }

//       if (order.status === "Cancel" && newStatus === "Cancel") {
//         return res.status(200).send({ message: "Order already canceled" });
//       }

//       if (newStatus === "Cancel" && order.status !== "Cancel") {
//         const items = JSON.parse(order.items);
//         for (const item of items) {
//           const product = await Product.findOne({
//             where: { id: item.productId },
//             transaction,
//           });
//           if (!product) {
//             throw new Error(`Product with ID ${item.productId} not found`);
//           }

//           const updatedQuantity = product.stock + item.quantity;
//           await Product.update(
//             { stock: updatedQuantity },
//             { where: { id: item.productId }, transaction }
//           );

//           console.log("Updated product quantity:", product.stock);
//         }
//       }

//       await order.update({ status: newStatus }, { transaction });

//       // Fetch user email
//       const user = await User.findByPk(order.userId);
//       if (!user) {
//         throw new Error(`User with ID ${order.userId} not found`);
//       }

//       // Set email content based on status
//       let emailSubject;
//       let emailMessage;

//       switch (newStatus) {
//         case "Pending":
//           emailSubject = "Your Order Has Been Received";
//           emailMessage = `
//            <h3>Your Order Has Been Received</h3>
// <p>Thank you for placing your order with us!</p>
// <p>Your order is currently in the <strong>Pending</strong> status. Once our team starts processing it, you will be notified via email.</p>
// <p>If you have any questions, feel free to contact our support team.</p>

//           `;
//           break;

//         case "Processing":
//           emailSubject = "Your Order is Now Being Processed";
//           emailMessage = `
//     <p>We are pleased to inform you that your order is now <strong>Processing</strong>.</p>
//     <p>Our team is preparing your items, and they will be shipped soon. You will receive a notification once your order is shipped.</p>
//     <p>Thank you for your patience!</p>`;
//           break;

//         case "Delivered":
//           emailSubject = "Your Order Has Been Delivered";
//           emailMessage = `
//             <p>Your order has been <strong>Delivered</strong>.</p>
//             <p>We hope you enjoy your purchase!</p>
//                       <p>Thank you for shopping with us!</p>

//           `;
//           break;

//         case "Cancel":
//           emailSubject = "Your Order Has Been Canceled";
//           emailMessage = `
//             <p>Your order has been <strong>Canceled</strong>.</p>
//             <p>If this was a mistake, please contact our support team.</p>
//           `;
//           break;

//         default:
//           emailSubject = "Order Status Update";
//           emailMessage = `<p>Your order status has been updated to: <strong>${newStatus}</strong>.</p>`;
//           break;
//       }

//       // Email body
//       const emailBody = {
//         from: process.env.EMAIL_USER,
//         to: user.email,
//         subject: emailSubject,
//         html: `
//           <h3>Order Status Updated</h3>
//           <p><strong>Order ID:</strong> #ON${order.id}</p>
//           ${emailMessage}
//         `,
//       };

//       sendOrderEmail(emailBody);

//       // Commit transaction
//       await transaction.commit();
//       res.status(200).send({ message: "Order Updated Successfully!" });
//     } catch (error) {
//       await transaction.rollback();
//       res.status(500).send({ message: error.message });
//     }
//   } catch (err) {
//     console.error("Error updating order:", err);
//     res.status(500).send({ message: err.message });
//   }
// };

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const destroyedRowCount = await Order.destroy({
      where: {
        id: orderId,
      },
    });

    if (destroyedRowCount > 0) {
      res.status(200).send({
        message: "Order Deleted Successfully!",
      });
    } else {
      res.status(404).send({
        message: "Order Not Found",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const bestSellerProductChart = async (req, res) => {
  try {
    const totalDoc = await Order.count();
    const allOrders = await Order.findAll({
      attributes: ["id", "items"],
    });

    // Parse cart data and create an array of cart items
    const cartItems = allOrders.flatMap((order) => {
      const parsedCart = JSON.parse(order.items);
      return parsedCart.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      }));
    });

    // Group and aggregate data
    const bestSellingProducts = cartItems.reduce((acc, currentItem) => {
      const existingItem = acc.find(
        (item) => item.productId === currentItem.productId
      );
      if (existingItem) {
        existingItem.count += currentItem.quantity;
      } else {
        acc.push({
          productId: currentItem.productId,
          count: currentItem.quantity,
        });
      }
      return acc;
    }, []);

    // Sort the  products in descending order of count
    bestSellingProducts.sort((a, b) => b.count - a.count);

    // Slice the array to get the top 4 best-selling products
    const top4BestSellingProducts = bestSellingProducts.slice(0, 4);

    // Fetch product names based on productIds
    const productIds = top4BestSellingProducts.map(
      (product) => product.productId
    );
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ["id", "title"],
    });
    // best selling products
    const top4BestSellingProductsWithNames = top4BestSellingProducts.map(
      (product) => {
        const productDetail = products.find((p) => p.id === product.productId);
        return {
          ...product,
          name: productDetail ? productDetail.title : "Unknown Product",
        };
      }
    );

    res.send({
      totalDoc,
      bestSellingProducts: top4BestSellingProductsWithNames,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDashboardOrders = async (req, res) => {
  const { page, limit } = req.query;

  // console.log(req.query);

  const currentPage = Number(page) || 1;
  const pageSize = Number(limit) || 8;
  const offset = (currentPage - 1) * pageSize;

  let week = new Date();
  week.setDate(week.getDate() - 10);

  const start = new Date();

  try {
    // Total order count
    const totalOrder = await Order.count();

    const totalAmount = await Order.sum("totalPrice");
    // console.log('>>>>>>>>> ',totalAmount);

    // Today's order count
    const todayOrder = await Order.count({
      where: {
        createdAt: { [Op.gte]: start.setHours(0, 0, 0, 0) },
        // [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });
    //  console.log(todayOrder);

    // total amount of this month
    const totalAmountOfThisMonth = await Order.sum("totalPrice", {
      where: sequelize.literal(
        "DATE_FORMAT(createdAt, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')"
      ),
    });

    // total pending order count
    const totalPendingOrder = await Order.count({
      where: { status: "Pending" },
    });

    // console.log('>>>>>>>>> ',totalPendingOrder);

    // total processing order count
    const totalProcessingOrder = await Order.count({
      where: { status: "Processing" },
    });

    // total delivered order count
    const totalDeliveredOrder = await Order.count({
      where: { status: "Delivered" },
    });

    // Weekly sale report
    const weeklySaleReport = await Order.findAll({
      where: {
        status: { [Op.like]: "%Delivered%" },
        createdAt: { [Op.gte]: week },
      },
    });
    // console.log(todayOrder);
    res.send({
      totalOrder,
      totalAmount: totalAmount || 0,
      todayOrder,
      totalAmountOfThisMonth: totalAmountOfThisMonth || 0,
      totalPendingOrder: totalPendingOrder || 0,
      totalProcessingOrder,
      totalDeliveredOrder,
      // orders,
      weeklySaleReport,
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).send({
      message: err.message,
    });
  }
};
module.exports = {
  getAllOrders,
  getOrderById,
  getOrderBySessionId,
  getOrderByUser,
  updateOrder,
  deleteOrder,
  bestSellerProductChart,
  getDashboardOrders,
};
