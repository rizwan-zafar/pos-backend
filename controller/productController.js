const { Op } = require("sequelize");
const Product = require("../models/Product");
const User = require("../models/User");
// const Admin = require("../models/Admin");
const fs = require("fs");
const path = require("path");

const addProduct = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const hasCode = !!req.body.productCode;

    // Step 1: Set temp product code if not provided
    const tempCode = hasCode ? req.body.productCode : `PRD-${Date.now()}`;
    const bodyWithCode = { ...req.body, productCode: tempCode };

    // Step 2: Create the product
    const newProduct = await Product.create(bodyWithCode);

    // Step 3: If code was auto-generated, update with real ID-based code
    if (!hasCode) {
      const finalCode = `PRD-${newProduct.id}`;
      await newProduct.update({ productCode: finalCode });
    }

    res.status(200).send({
      message: "Product Added Successfully!",
      productCode: hasCode ? req.body.productCode : `PRD-${newProduct.id}`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addAllProducts = async (req, res) => {
  try {
    // Delete all existing products
    await Product.destroy({ truncate: true }); //

    // Insert new products one by one
    for (const productData of req.body) {
      await Product.create(productData); //
    }

    // Respond with success message
    res.status(200).send({
      message: "Products Added successfully!",
    });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message,
    });
  }
};

const getShowingProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      //
      where: { status: "Show" },
      order: [["id", "DESC"]],
    });
    res.send(products);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDiscountedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      //
      where: {
        discount: { [Op.gt]: 5 },
      },
      order: [["id", "DESC"]],
    });
    res.send(products);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  const { title, category, price, page, limit, all, isDashboard } = req.query;

  const queryObject = {};

  if (!isDashboard) {
    queryObject.status = "Show";
  }

  let order;
  if (price === "new-arrival") {
    order = [["createdAt", "DESC"]];
  } else if (price === "lowest") {
    order = [["price", "ASC"]];
  } else if (price === "highest") {
    order = [["price", "DESC"]];
  } else {
    order = [["id", "DESC"]];
  }

  if (title) {
    queryObject[Op.or] = [
      { title: { [Op.like]: `%${title}%` } },
      { productCode: { [Op.like]: `%${title}%` } },
    ];
  }

  if (category) {
    const categoriesArray = category.split(",").map((cat) => cat.trim());
    queryObject[Op.or] = [
      {
        parent: {
          [Op.or]: categoriesArray.map((cat) => ({ [Op.like]: `%${cat}%` })),
        },
      },
      {
        children: {
          [Op.or]: categoriesArray.map((cat) => ({ [Op.like]: `%${cat}%` })),
        },
      },
    ];
  }

  try {
    let products;
    let totalDoc;

    if (all === "true") {
      products = await Product.findAll({
        where: queryObject,
        order: order,
      });
      totalDoc = products.length;
    } else {
      const currentPage = Number(page) || 1;
      const limitPerPage = Number(limit) || 10;
      const offset = (currentPage - 1) * limitPerPage;

      // console.log(">>>> limit ", limit );
      // console.log(">>>> currentpage ", page);
      // console.log(offset);

      const allProducts = await Product.findAll({
        where: queryObject,
        order: order,
      });

     
      const filteredProducts = allProducts.filter((product) => {
        const variations = JSON.parse(product.variations || "[]");
        const hasStockInVariations = variations.some(
          (variation) => Number(variation.stock) > 0
        );
        return product.stock > 0 || hasStockInVariations;
      });

      totalDoc = filteredProducts.length;
      products = !isDashboard ? filteredProducts.slice(offset, offset + limitPerPage):filteredProducts
      // products = filteredProducts;
    }

    const productsithGalleryReverse = products.map((product) => {
      let gallery = "[]";
      // console.log(">>>>>>>> BEFORE: ", product.gallery);

      try {
        const parsedGallery = JSON.parse(product.gallery || "[]");
        gallery = JSON.stringify(parsedGallery.reverse());
      } catch (err) {
        console.error("Error parsing gallery for product id:", product.id);
      }
      // console.log(">>>>>>>> AFTER: ", gallery);

      return {
        ...product.toJSON(),
        gallery,
      };
    });

    res.send({
      totalDoc,
      limitPerPage: all === "true" ? totalDoc : Number(limit) || 10,
      currentPage: all === "true" ? 1 : Number(page) || 1,
      products: productsithGalleryReverse || "Product Not Found",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const _getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["title", "ASC"]],
    });

    // reverse gallery for each product
    const updatedProducts = products.map((product) => {
      let gallery = [];
      // console.log(">>>>>>>> BEFORE: ", product.gallery);

      try {
        gallery = JSON.parse(product.gallery || "[]");
        gallery = gallery.reverse();
      } catch (err) {
        console.error("Error parsing gallery for product id:", product.id);
      }
      // console.log(">>>>>>>> AFTER: ", gallery);
      return {
        ...product.toJSON(),
        gallery,
      };
    });

    res.status(200).json(updatedProducts);
  } catch (err) {
    console.error("Error fetching All Products without limit:", err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const getStockOutProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      //
      where: {
        quantity: {
          [Op.lt]: 1,
        },
      },
      order: [["id", "DESC"]],
    });

    res.send(products);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// const getProductBySlug = async (req, res) => {
//   // console.log('req>>>>>>>>>>> ', req.params);
//   console.log("req>>>>>>>>>>> ");
//   try {
//     // const product = await Product.findOne({ where: { slug: req.params.slug } });
//     const product = await Product.findOne({
//       where: { title: req.params.slug },
//     });
//     res.send(product);
//   } catch (err) {
//     res.status(500).send({
//       message: `Slug problem, ${err.message}`,
//     });
//   }
// };

// const getProductsByCategory = async (req, res) => {
//   try {
//     const product = await Product.findAll({
//       where: { category_id: req.params.categoryId },
//     });
//     res.send(product);
//   } catch (err) {
//     res.status(500).send({
//       message: `Product By Category problem, ${err.message}`,
//     });
//   }
// };

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { title: req.params.slug },
    });

    if (product) {
      let gallery = "[]";
      try {
        const parsedGallery = JSON.parse(product.gallery || "[]");
        gallery = JSON.stringify(parsedGallery.reverse());
      } catch (err) {
        console.error("Error parsing gallery:", err.message);
      }

      res.send({
        ...product.toJSON(),
        gallery, // reversed and stringified
      });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).send({
      message: `Slug problem, ${err.message}`,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { category_id: req.params.categoryId },
    });

    const updatedProducts = products.map((product) => {
      let gallery = "[]";
      try {
        const parsedGallery = JSON.parse(product.gallery || "[]");
        gallery = JSON.stringify(parsedGallery.reverse());
      } catch (err) {
        console.error("Error parsing gallery:", err.message);
      }

      return {
        ...product.toJSON(),
        gallery,
      };
    });

    res.send(updatedProducts);
  } catch (err) {
    res.status(500).send({
      message: `Product By Category problem, ${err.message}`,
    });
  }
};

const getProductById = async (req, res) => {
  // console.log('------------',req.params);
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone", "address"],
          required: false, // This makes it LEFT JOIN instead of INNER JOIN
        },
      ],
    });

    if (product) {
      let gallery = "[]";
      try {
        const parsedGallery = JSON.parse(product.gallery || "[]");
        gallery = JSON.stringify(parsedGallery.reverse());
      } catch (err) {
        console.error("Error parsing gallery:", err.message);
      }

      res.send({
        ...product.toJSON(),
        gallery,
      });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    console.error("Error in getProductById:", err);
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    // console.log("hello", JSON.stringify(req.body, null, 2));
    console.log("hello pagal", req.body.variations);
    const product = await Product.findByPk(req.params.id); //
    if (product) {
      const updatedProduct = await product.update({
        title: req.body.title,
        description: req.body.description,
        parent: req.body.parent,
        children: req.body.children,
        price: req.body.price,
        promo_price_pkr: req.body.promo_price_pkr,
        price_usd: req.body.price_usd,
        promo_price_usd: req.body.promo_price_usd,
        stock: req.body.stock,
        image: req.body.image,
        gallery: req.body.gallery,
        tag: req.body.tag,
        category_id: req.body.category_id,
        brand: req.body.brand,
        productCode: req.body.productCode,
        delivery: req.body.delivery,
        variations: req.body.variations,
      });

      res.send({
        data: updatedProduct,
        message: "Product updated successfully!",
      });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
    // handleProductStock(updatedProduct);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;
    const updatedProduct = await Product.update(
      //
      { status: newStatus },
      { where: { id: req.params.id } }
    );
    if (updatedProduct[0] === 1) {
      res.status(200).send({
        message: `Product ${newStatus} Successfully!`,
      });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// const deleteProduct = async (req, res) => {
//   try {
//     const deletedProductCount = await Product.destroy({
//       //
//       where: { id: req.params.id },
//     });
//     if (deletedProductCount === 1) {
//       res.status(200).send({
//         message: "Product Deleted Successfully!",
//       });
//     } else {
//       res.status(404).send({ message: "Product not found" });
//     }
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// };

const deleteProduct = async (req, res) => {
  try {
    // Fetch the product to get the image path
    const product = await Product.findOne({ where: { id: req.params.id } });

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // Delete the main product image
    if (product.image) {
      const imageName = path.basename(product.image); // Extract image name from URL
      const imagePath = path.join(__dirname, "../upload", imageName); // Construct local path
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image
      }
    }

    // Delete gallery images if applicable
    if (product.gallery) {
      const galleryImages = JSON.parse(product.gallery); // Assuming gallery is stored as a JSON string
      galleryImages.forEach((imageUrl) => {
        const imageName = path.basename(imageUrl); // Extract image name from URL
        const galleryImagePath = path.join(__dirname, "../upload", imageName); // Construct local path
        if (fs.existsSync(galleryImagePath)) {
          fs.unlinkSync(galleryImagePath); // Delete each image
        }
      });
    }

    // Delete the product from the database
    const deletedProductCount = await Product.destroy({
      where: { id: req.params.id },
    });

    if (deletedProductCount === 1) {
      res.status(200).send({ message: "Product Deleted Successfully!" });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
module.exports = {
  addProduct,
  addAllProducts,
  getAllProducts,
  getShowingProducts,
  getDiscountedProducts,
  getStockOutProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  updateStatus,
  deleteProduct,
  getProductsByCategory,
  _getAllProducts,
};
