const AppPromotion = require("../../models/settings/AppPromotion");
const fs = require("fs");
const path = require("path");
const Product = require("../../models/Product");

// Create a new app promotion banner
const createAppPromoBanner = async (req, res) => {
  const { startDate, endingDate, productId } = req.body;

  //  validate  date order

  if (new Date(startDate) >= new Date(endingDate)) {
    return res.status(400).json({
      error: "Start date must be earlier than ending date.",
    });
  }

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found!",
      });
    }
    const promotionBanner = await AppPromotion.create({
      ...req.body,
      productId,
    });
    res.status(201).json({
      banner: promotionBanner,
      message: "App promotion banner created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create app promotion banner",
      details: error.message,
    });
  }
};

// Get all app promotion  banners
const getAllAppPromoBanners = async (req, res) => {
  try {
    const promotionBanner = await AppPromotion.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "price", "image"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.send({ banners: promotionBanner, totalDoc: promotionBanner.length });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch app promo banners",
      details: error.message,
    });
  }
};

// Update status

const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.isVisible;

    const updatedPromoBanner = await AppPromotion.update(
      //
      { isVisible: newStatus },
      { where: { id: req.params.id } }
    );
    if (updatedPromoBanner[0] === 1) {
      res.status(200).send({
        message: `Banner ${newStatus ? "Show" : "Hide"} Successfully!`,
      });
    } else {
      res.status(404).send({ message: "App Promo Banner not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get a single promo banner by ID
const getPromoBannerById = async (req, res) => {
  console.log("hello", req.params.id);

  try {
    const banner = await AppPromotion.findByPk(req.params.id);
    if (!banner)
      return res.status(404).json({ error: "App Promotion Banner not found" });

    res.json(banner);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch app promo banner",
      details: error.message,
    });
  }
};

// Update a promo banner
const updatePromoBanner = async (req, res) => {
  const { startDate, endingDate } = req.body;

  //  validate  date order

  if (new Date(startDate) >= new Date(endingDate)) {
    return res.status(400).json({
      error: "Start date must be earlier than ending date.",
    });
  }

  try {
    const banner = await AppPromotion.findByPk(req.params.id);
    if (!banner)
      return res.status(404).json({ error: "Promotion Banner not found" });

    const oldImage = banner.image;
    const newImage = req.body.image;
    const oldSmImage = banner.smImage;
    const newSmImage = req.body.smImage;

    //////// small screen image
    if (newSmImage && oldSmImage && newSmImage !== oldSmImage) {
      const imageName = path.basename(oldSmImage); // get file name
      const imagePath = path.join(__dirname, "../../upload", imageName);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // delete the image
        console.log("Old small image deleted:", imageName);
      }
    }
    //////// large screen image
    if (newImage && oldImage && newImage !== oldImage) {
      const imageName = path.basename(oldImage); // get file name
      const imagePath = path.join(__dirname, "../../upload", imageName);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // delete the image
        console.log("Old image deleted:", imageName);
      }
    }

    await banner.update(req.body);
    res.json({ banner, message: "App promo banner updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update app promotion banner",
      details: error.message,
    });
  }
};

// Delete  banner

const deletePromoBanner = async (req, res) => {
  try {
    const banner = await AppPromotion.findByPk(req.params.id);
    if (!banner)
      return res.status(404).json({ error: "Promotion Banner not found" });

    // remove image
    if (banner.image) {
      const imageName = path.basename(banner.image); // extract file name
      const imagePath = path.join(__dirname, "../../upload", imageName);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // delete file
        console.log("Image deleted:", imageName);
      }
    }
    if (banner.smImage) {
      const imageName = path.basename(banner.smImage); // extract file name
      const imagePath = path.join(__dirname, "../../upload", imageName);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // delete file
        console.log(" Small Image deleted:", imageName);
      }
    }

    await banner.destroy();
    res.json({ message: "Promo Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete app promo banner",
      details: error.message,
    });
  }
};

module.exports = {
  createAppPromoBanner,
  getAllAppPromoBanners,
  updateStatus,
  getPromoBannerById,
  updatePromoBanner,
  deletePromoBanner,
};
