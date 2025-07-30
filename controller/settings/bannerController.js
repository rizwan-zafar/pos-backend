const Banner = require("../../models/settings/Banner");
const fs = require("fs");
const path = require("path");
const Product = require("../../models/Product");

// create new banner

const createBanner = async (req, res) => {
  console.log("bannerData ", req.body);
  const { startDate, endingDate, pId } = req.body;

  //  validate  date order

  if (new Date(startDate) >= new Date(endingDate)) {
    return res.status(400).json({
      error: "Start date must be earlier than ending date.",
    });
  }

  try {
    const product = await Product.findByPk(pId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found!",
      });
    }

    const banner = await Banner.create({ ...req.body, pId });
    res.status(201).json({ banner, message: "Banner created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create banner", details: error.message });
  }
};

// Get all banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [["id", "DESC"]],
      include: [
        {
          model: Product, // This should match the associated model
          as: "product", // Alias used in the association
        },
      ],
    });
    res.send({ banners, totalDoc: banners.length });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch banners", details: error.message });
  }
};

// Update status

const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.isVisible;

    const updatedBanner = await Banner.update(
      //
      { isVisible: newStatus },
      { where: { id: req.params.id } }
    );
    if (updatedBanner[0] === 1) {
      res.status(200).send({
        message: `Banner ${newStatus ? "Show" : "Hide"} Successfully!`,
      });
    } else {
      res.status(404).send({ message: "Banner not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get a single banner by ID
const getBannerById = async (req, res) => {
  try {
    // const banner = await Banner.findByPk(req.params.id);
  const banner = await Banner.findByPk(req.params.id, {
      include: [
        {
          model: Product, 
          as: "product", 
        },
      ],
    });
    if (!banner) return res.status(404).json({ error: "Banner not found" });
    res.json(banner);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch banner", details: error.message });
  }
};

// Update a banner
const updateBanner = async (req, res) => {
  const { startDate, endingDate } = req.body;

  //  validate  date order

  if (new Date(startDate) >= new Date(endingDate)) {
    return res.status(400).json({
      error: "Start date must be earlier than ending date.",
    });
  }

  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

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
    res.json({ banner, message: "Banner updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update banner", details: error.message });
  }
};

// Delete  banner

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

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
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete banner",
      details: error.message,
    });
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  updateStatus,
  getBannerById,
  updateBanner,
  deleteBanner,
};
