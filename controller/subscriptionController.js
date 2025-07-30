const Subscription = require("../models/Subscription");


const addSubscription = async (req, res) => {
  try {
    const { email, status } = req.body;

    // Check for required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    // Check for existing subscription
    const existingSubscribeUser = await Subscription.findOne({
      where: { email },
    });

    if (existingSubscribeUser) {
      return res.status(409).json({
        message: "This email is already subscribed!",
      });
    }

    // Create new subscription
    const subscription = await Subscription.create({
      email,
      status: status || "active",
    });

    res.status(201).json({
      message: "Subscription added successfully!",
      subscription,
    });
  } catch (error) {
    console.error("Error adding subscription:", error);

    // Handle validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: error.errors.map((err) => err.message).join(", "),
      });
    }

    res.status(500).json({ message: "Internal server error!" });
  }
};

// get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      order: [["id", "DESC"]],
    });
    
    
    res.send(subscriptions);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};






const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // check valid status
    if (!["active", "canceled", "expired"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Valid values are 'active', 'canceled', 'expired'.",
      });
    }

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found!",
      });
    }

    // Update status
    subscription.status = status;
    await subscription.save();

    res.status(200).json({
      message: "Subscription status updated successfully!",
      subscription,
    });
  } catch (error) {
    console.error("Error updating subscription status:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Delete subscription
const deleteSubscription = async (req, res) => {
    console.log("hello");
    
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found!",
      });
    }

    await subscription.destroy();

    res.status(200).json({
      message: "Subscription deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

module.exports = {
  addSubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
  deleteSubscription,
};


