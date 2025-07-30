const Category = require("../models/Category");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

const addCategory = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  try {
    const { name, icon, children } = req.body;

    const newCategory = await Category.create({
      name,
      icon,
      children,
    });
    res.status(200).send({
      message: "Category Added Successfully!",
      // category: newCategory,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addAllCategory = async (req, res) => {
  try {
    await Category.bulkCreate(req.body);
    res.status(200).send({
      message: "Category Added successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getShowingCategory = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: "Show" }, // Filtering condition
      order: [["id", "DESC"]], // Sorting in descending order by 'id'
    });
    res.send(categories);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllCategory = async (req, res) => {
  // console.log("query ", req.query);
  const { isDashboard } = req.query;
  try {
    const queryObject = {};

    if (!isDashboard || isDashboard === "false") {
      queryObject.status = "show";
    }

    // else{
    //   queryObject.status = { [Op.ne]: "Hide" };

    //   }
    const categories = await Category.findAll({
      where: queryObject,
      // order: [["id", "DESC"]],
    });
    // console.log(categories);
    res.json(categories);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      res.send(category);
    } else {
      res.status(404).send({
        message: "Category not found",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateCategory = async (req, res) => {
  // console.log(JSON.stringify(req.body, null, 2));

  try {
    const category = await Category.findByPk(req.params.id);
    // console.log(category);
    if (!category) {
      return res.status(404).send({ message: "Category not found!" });
    }

    let updated = await Category.update(
      {
        name: req.body.name,
        // Assuming you want to uncomment and use slug update as well
        // slug: req.body.slug,
        // type: req.body.type,
        icon: req.body.icon,
        children: req.body.children,
      },
      {
        where: { id: req.params.id },
      }
    );

    res.send({ message: "Category Updated Successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    // Using Sequelize `update` method to change the status of a category
    const [updated] = await Category.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );

    if (req.body.status === "Hide") {
      // update related produtcs status
      await Product.update(
        { status: "Hide" },
        { where: { category_id: req.params.id } }
      );
    } else {
      await Product.update(
        { status: "Show" },
        { where: { category_id: req.params.id } }
      );
    }

    if (updated) {
      res.status(200).send({
        message: `Category ${req.body.status} Successfully!`,
      });
    } else {
      res.status(404).send({
        message: "Category not found!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// const deleteCategory = async (req, res) => {
//   try {
//     // find category
//     const category = await Category.findOne({ where: { id: req.params.id } });

//     if (!category) {
//       return res.status(404).send({
//         message: "Category not found!",
//       });
//     }

//     // Extract the filename from the full URL
//     const imageUrl = category.icon;
//     const imageName = path.basename(imageUrl); // Extract filename from URL
//     // console.log(">>>> imageName ", imageName);

//     // Delete associated image file from the upload folder
//     const imagePath = path.join(__dirname, "../upload", imageName);
//     if (fs.existsSync(imagePath)) {
//       fs.unlinkSync(imagePath);
//       console.log(`Image deleted: ${imagePath}`);
//     } else {
//       console.log(`Image not found: ${imagePath}`);
//     }

//     // Delete the category from the database
//     const deleted = await Category.destroy({
//       where: { id: req.params.id },
//     });

//     if (deleted) {
//       res.status(200).send({
//         message: "Category and associated image deleted successfully!",
//       });
//     } else {
//       res.status(404).send({
//         message: "Category not found!",
//       });
//     }
//   } catch (err) {
//     res.status(500).send({
//       message: err.message,
//     });
//   }
// };

const deleteCategory = async (req, res) => {
  try {
    // Find the category
    const category = await Category.findOne({ where: { id: req.params.id } });

    if (!category) {
      return res.status(404).send({ message: "Category not found!" });
    }

    // Find all related products
    const products = await Product.findAll({
      where: { category_id: req.params.id },
    });


    for (const product of products) {
      console.log("Processing product:", product.id);

      // Handle single image or gallery
      const images = [];

      if (product.image) {
        // If `image` exists, add it to the images array
        images.push(product.image);
      }

      if (product.gallery) {
        // Check if gallery is a JSON string and parse it
        try {
          const galleryImages = Array.isArray(product.gallery)
            ? product.gallery // Already an array
            : JSON.parse(product.gallery); // Parse JSON string if needed

          images.push(...galleryImages); // Add gallery images to the array
        } catch (err) {
          console.error(
            "Failed to parse gallery:",
            product.gallery,
            err.message
          );
        }
      }

      // Loop through all images and delete them
      for (const imageUrl of images) {
        const imageName = path.basename(imageUrl);
        const imagePath = path.join(__dirname, "../upload", imageName);

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        } else {
          console.log(`Image not found: ${imagePath}`);
        }
      }
    }

    // Delete all related products
    await Product.destroy({ where: { category_id: req.params.id } });

    // Extract and delete category image
    const categoryImageUrl = category.icon;
    const categoryImageName = path.basename(categoryImageUrl);
    const categoryImagePath = path.join(
      __dirname,
      "../upload",
      categoryImageName
    );

    if (fs.existsSync(categoryImagePath)) {
      fs.unlinkSync(categoryImagePath);
      console.log(`Category image deleted: ${categoryImagePath}`);
    }

    // Delete the category
    const deleted = await Category.destroy({ where: { id: req.params.id } });

    if (deleted) {
      res.status(200).send({
        message:
          "Category, related products, and all associated images deleted successfully!",
      });
    } else {
      res.status(404).send({ message: "Category not found!" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  addCategory,
  addAllCategory,
  getAllCategory,
  getShowingCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
};
