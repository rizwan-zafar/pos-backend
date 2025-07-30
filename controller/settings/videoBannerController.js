const Product = require("../../models/Product");
const VideoBanner = require("../../models/settings/VideoBanner");
const fs = require("fs");
const path = require("path");


const uploadVideo = async (req, res) => {
  try {
    const videoBanner = await VideoBanner.create(req.body);

    res.status(201).json({
      message: "Video banner uploaded successfully.",
      data: videoBanner,
    });
  } catch (error) {
    console.error("Error uploading video banner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await VideoBanner.findAll({
      order: [["id", "DESC"]],
      include: [
        {
          model: Product,
          as: "product",
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
  console.log(">>>>>>>>>>>  ", req.body.isVisible);
  
  try {
    const newStatus = req.body.isVisible;

    const updatedBanner = await VideoBanner.update(
      //
      { isVisible: newStatus },
      { where: { id: req.params.id } }
    );
    if (updatedBanner[0] === 1) {
      res.status(200).send({
        message: `Video Banner ${newStatus ? "Show" : "Hide"} Successfully!`,
      });
    } else {
      res.status(404).send({ message: "Video Banner not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get a single banner by ID
const getBannerById = async (req, res) => {
  try {
    // const banner = await Banner.findByPk(req.params.id);
    const banner = await VideoBanner.findByPk(req.params.id, {
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
    const banner = await VideoBanner.findByPk(req.params.id);
    if (!banner)
      return res.status(404).json({ error: "Video Banner not found" });

    const oldVideo = banner.video;
    const newVideo = req.body.video;

   
    if (newVideo && oldVideo && newVideo !== oldVideo) {
      const videoName = path.basename(oldVideo); // get file name
      const videoPath = path.join(__dirname, "../../upload/videos", videoName);

      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath); // delete the video
        console.log("Old video deleted:", videoName);
      }
    }

    await banner.update(req.body);
    res.json({ banner, message: "Video Banner updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update banner", details: error.message });
  }
};

// Delete  banner

const deleteBanner = async (req, res) => {
  try {
    const banner = await VideoBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    // remove video
    if (banner.video) {
      const videoName = path.basename(banner.video); // extract file name
      const videoPath = path.join(__dirname, "../../upload/videos", videoName);

      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath); // delete file
        console.log("Video deleted:", videoName);
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
  uploadVideo,
  getAllBanners,
  updateStatus,
  getBannerById,
  updateBanner,
  deleteBanner,
};
