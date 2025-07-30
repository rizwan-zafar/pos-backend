const { Op } = require("sequelize");
const Review = require("../models/Reviews");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Product = require("../models/Product");

// const addReview = async (req, res) => {
//   try {
//     const { productId, userId, ratings, message, title } = req.body;

//     if (!productId || !userId || !ratings) {
//       return res
//         .status(400)
//         .json({ message: "Product ID, User ID, and Rating are required." });
//     }

//     // Create the review
//     const newReview = await Review.create({
//       productId,
//       userId,
//       ratings,
//       message,
//       title,
//     });

//     const reviewWithUser = await Review.findOne({
//       where: { id: newReview.id },
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["name"],
//         },
//       ],
//     });

//     res.status(201).json({
//       message: "Review added successfully.",
//       review: reviewWithUser,
//     });
//   } catch (error) {
//     console.error("Error adding review:", error);
//     res.status(500).json({ message: "Failed to add review.", error });
//   }
// };

const addReview = async (req, res) => {
  console.log("req ???? >>>>>>>> ", req.body);

  try {
    const {
      productId,
       userId = null,
      ratings,
      message,
      title,
      adminId,
      reviewerName,
    } = req.body;

    if (!productId || !title || !message || !ratings) {
      return res
        .status(400)
        .json({
          message: "Product ID, Message, Title, and Rating are required.",
        });
    }

    // Create the review
    const newReview = await Review.create({
      productId,
      userId: userId || null,
      ratings,
      message,
      title,
      adminId,
      reviewerName,
    });

    let reviewWithUser;
    if (userId) {
      reviewWithUser = await Review.findOne({
        where: { id: newReview.id },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name"],
          },
        ],
      });
    } else {
      reviewWithUser = await Review.findOne({
        where: { id: newReview.id },
      });
    }

    res.status(201).json({
      message: "Review added successfully.",
      review: reviewWithUser,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Failed to add review.", error });
  }
};

const getAllReviews = async (req, res) => {
  console.log(">>>>. hello <<<<<<<<<<");

  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
        {
          model: Product,
          as: "product",
          attributes: ["title"],
        },
      ],
      order: [["id", "DESC"]],
    });
    // console.log("?????????? ", reviews.length);

    res.send(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Update status

const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;

    const updatedReview = await Review.update(
      { status: newStatus },
      { where: { id: req.params.id } }
    );
    if (updatedReview[0] === 1) {
      res.status(200).send({
        message: `Review ${newStatus} Successfully!`,
      });
    } else {
      res.status(404).send({ message: "Review not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    await review.destroy();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete review",
      details: error.message,
    });
  }
};

const getReviewsByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.findAll({
      where: { productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product." });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

module.exports = {
  addReview,
  getAllReviews,
  getReviewsByProductId,
  updateStatus,
  deleteReview,
};
