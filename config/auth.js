require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Admin = require("../models/Admin");

const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user.id, // Assuming 'id' is the primary key field in MySQL
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
};

const tokenForVerify = (user) => {
  return jwt.sign(
    {
      _id: user.id, // Assuming 'id' is the primary key field in MySQL
      name: user.name,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET_FOR_VERIFY,
    { expiresIn: "15m" }
  );
};

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  try {
    const token = authorization.split(" ")[1];
    // const token = req.headers.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const isAdmin = async (req, res, next) => {
  const admin = await Admin.findOne({ role: "Admin" });
  if (admin) {
    next();
  } else {
    res.status(401).send({
      message: "User is not Admin",
    });
  }
};

const sendEmail = async (body, res, message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    service: process.env.SERVICE, //comment this line if you use custom server/domain
    port: process.env.EMAIL_PORT,
    security: false,
        auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    requireTLS: true 
    
  });
  transporter.sendMail(body, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });

 
  res.status(200).send({
    message,
  });
};


const sendOrderEmail = async (body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      security: false,
      auth: {
        user: process.env.EMAIL_ORDER,
        pass: process.env.EMAIL_PASS,
      },
      requireTLS: true,
    });

    // Send the email
    await transporter.sendMail(body);
  } catch (error) {
    throw new Error("Error occurred while sending the email.");
  }
};

const sendMessageEmail = async (body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      security: false,
      auth: {
        user: process.env.EMAIL_SUPPORT,
        pass: process.env.EMAIL_PASS,
      },
      requireTLS: true,
    });

    // Send the email
    await transporter.sendMail(body);
  } catch (error) {
    throw new Error("Error occurred while sending the email.");
  }
};


module.exports = {
  signInToken,
  tokenForVerify,
  isAuth,
  isAdmin,
  sendEmail,
  sendOrderEmail,
  sendMessageEmail
};
