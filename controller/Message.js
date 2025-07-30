const nodemailer = require("nodemailer");
const Admin = require("../models/Admin");
const Message = require("../models/Message");
const { sendMessageEmail } = require("../config/auth");

const createMessage = async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Validate inputs
    if (!fullName || !email || !message) {
      return res
        .status(400)
        .json({ message: "Full name, email, and message are required!" });
    }

    // Save the message in the database
    const newMessage = await Message.create({
      fullName,
      email,
      phone,
      message,
    });

    // Fetch all admin users
    const admins = await Admin.findAll();

    if (!admins.length) {
      return res.status(400).json({ message: "No admins found to notify!" });
    }

    for (const admin of admins) {
      const adminEmailBody = {
        from: `"Lidrah Support" <${process.env.EMAIL_SUPPORT}>`,
        to: admin.email,
        subject: "New Message Received",
        html: `
  <div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
    <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.75);">
      
      <!-- Header -->
      <div style="text-align:center;padding:40px 20px 20px;">
        <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
        <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
      </div>

      <!-- Content -->
      <div style="padding:40px 20px;text-align:left;color:#f2f2f2;">
        <h2 style="font-size:24px;margin-bottom:20px;color:#b2674b;">New Message Received</h2>

        <p><strong>From:</strong> ${fullName} (${email})</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#1a1a1a;padding:15px;border-radius:5px;color:#e0e0e0;">${message}</p>

        <hr style="border:0;height:1px;background:#555;margin:30px 0;" />

        <p><strong>Status:</strong> ${newMessage.status}</p>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:30px 20px;color:#ccc;font-size:13px;">
        <p>&copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.</p>
      </div>

    </div>
  </div>
`,
      };
      sendMessageEmail(adminEmailBody, "Message Email sent successfully");
    }

    res.status(201).json({
      message: "Message sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Get all messages
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [["id", "DESC"]],
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Update message status
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(" >>>>>>>>>>>> status >>>>>>>> ", status);
    
    // Valid statuses
    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Valid values are 'pending', 'resolved'.",
      });
    }

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found!",
      });
    }

    // Update status
    message.status = status;
    await message.save();

    res.status(200).json({
      message: "Message status updated successfully!",
      updatedMessage: message,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found!",
      });
    }

    await message.destroy();

    res.status(200).json({
      message: "Message deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
};
