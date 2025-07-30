const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const jwt = require("jsonwebtoken");
const {signInToken, tokenForVerify, sendEmail} = require("../config/auth");
const Admin = require("../models/Admin");
const fs = require("fs");
const path = require("path");

const registerAdmin = async (req, res) => {
    try {
        const isAdded = await Admin.findOne({ // where: { email: "user14@gmail.com" },
            where: {
                email: req.body.email
            }
        }); //
        if (isAdded) {
            return res.status(403).send({message: "This Email already Added!"});
        } else {
            const newStaff = new Admin({
                name: req.body.name,
                email: req.body.email,
                role: req.body.role,
                password: bcrypt.hashSync(req.body.password)
            });
            const staff = await newStaff.save();
            const token = signInToken(staff);
            res.send({
                token,
                _id: newStaff.id, // Assuming the primary key field is 'id' in MySQL
                name: staff.name,
                email: staff.email,
                role: staff.role,
                joiningData: Date.now()
            });
        }
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

const loginAdmin = async (req, res) => {
    console.log("hello aedmin");

    try {
        const admin = await Admin.findOne({
            where: {
                email: req.body.email,
                role: "Admin"
            }
        }); //
        if (admin && bcrypt.compareSync(req.body.password, admin.password)) {
            const token = signInToken(admin);
            res.send({
                token,
                _id: admin.id, // Assuming the primary key field is 'id' in MySQL
                name: admin.name,
                phone: admin.phone,
                email: admin.email,
                image: admin.image
            });
        } else {
            res.status(401).send({message: "Invalid Email or password!"});
        }
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

const forgetPassword = async (req, res) => {
    const isAdded = await Admin.findOne({
        where: {
            email: req.body.verifyEmail
        },
        attributes: ["email"]
    }); //
    console.log(">>>>>>>>>>>", isAdded);
    if (! isAdded) {
        return res.status(404).send({message: "Admin/Staff Not found with this email!"});
    } else {
        const token = tokenForVerify(isAdded);
        const body = {
            from: process.env.EMAIL_FROM,
            to: `${
                req.body.verifyEmail
            }`,
            subject: "Password Reset",

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
        <h2 style="font-size:24px;margin-bottom:20px;color:#b2674b;">Reset Your Password</h2>

        <p>Hello <strong>${
                req.body.verifyEmail
            }</strong>,</p>
        <p>We received a request to reset the password for your <strong>Lidrah</strong> account.</p>

        <p>This link will expire in <strong>15 minutes</strong>.</p>
        <p style="margin-bottom:20px;">Click the button below to reset your password:</p>

        <a href=${
                process.env.ADMIN_URL
            }/reset-password/${token}
           style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;font-weight:bold;padding:12px 30px;border-radius:5px;border:1px solid #22c55e;">
          Reset Password
        </a>

        <p style="margin-top:35px;">If you did not initiate this request, please contact us immediately at 
        <a href="mailto:support@lidrah.com" style="color:#b2674b;text-decoration:none;">support@lidrah.com</a>.</p>

        <p style="margin-bottom:0;">Thank you,</p>
        <strong style="color:#ffffff;">Lidrah Team</strong>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:30px 20px;color:#ccc;font-size:13px;">
        <p>&copy; ${
                new Date().getFullYear()
            } <strong style="color:#fff;">Lidrah</strong>. All rights reserved.</p>
      </div>

    </div>
  </div>
`
        };
        const message = "Please check your email to reset password!";
        await sendEmail(body, res, message); // Assuming sendEmail is an asynchronous function
    }
};

const resetPassword = async (req, res) => {
    const token = req.body.token;
    const {email} = jwt.decode(token);
    const staff = await Admin.findOne({
        where: {
            email: email
        }
    }); //

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY, (err, decoded) => {
            if (err) {
                return res.status(500).send({message: "Token expired, please try again!"});
            } else {
                const hashedPassword = bcrypt.hashSync(req.body.newPassword);
                staff.update({password: hashedPassword});
                res.send({message: "Your password change successful, you can login now!"});
            }
        });
    }
};

const addStaff = async (req, res) => {
    try { // Check if the email already exists
        const isAdded = await Admin.findOne({
            where: {
                email: req.body.data.email
            }
        }); //
        if (isAdded) {
            return res.status(400).send({message: "This Email already Added!"});
        } else { // Hash password
            const hashedPassword = bcrypt.hashSync(req.body.data.password, 8);
            // Extract the filename from the URL
            // const imageUrl = new URL(req.body.data.image);
            // const filename = imageUrl.pathname.split("/").pop(); // Gets 'test.png'

            // Create a new staff member
            await Admin.create({
                name: req.body.data.name,
                email: req.body.data.email,
                password: hashedPassword,
                phone: req.body.data.phone,
                joiningDate: req.body.data.joiningDate,
                role: req.body.data.role,
                // image: decodeURIComponent(filename), // Use the extracted filename
            });
            res.status(200).send({message: "Staff Added Successfully!"});
        }
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

const getAllStaff = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            order: [
                ["createdAt", "DESC"]
            ], // Assuming 'createdAt' is automatically managed by Sequelize. Adjust if using a different field for sorting.
        });
        // console.log(">>>>>>>>>>>>>> hello admin", admins);
        res.send(admins);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

const getStaffById = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id); //
        const modifiedAdmin = {
            ... admin.dataValues,
            // image: `${process.env.BACKEND_URL}/upload/${admin.image}`,
        };

        console.log(modifiedAdmin);

        res.send(modifiedAdmin);
        // res.send(admin);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

const updateStaff = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);

        if (! admin) {
            return res.status(404).send("Admin not found");
        }

        // const imageUrl = new URL(req.body.data.image);
        // const encodedFilename = imageUrl.pathname.split("/").pop();
        // const filename = decodeURIComponent(encodedFilename);
        // const oldImageFilename = decodeURIComponent(admin.image);

        // Prepare data to update
        const dataToUpdate = {
            name: req.body.data.name,
            email: req.body.data.email,
            phone: req.body.data.phone,
            role: req.body.data.role,
            joiningDate: dayjs.utc(req.body.data.joiningDate).format(),
            // Ensure format matches DB
            // image: filename,
        };

        // Verify and Update Password

        if (!req.body.data ?. oldPassword && req.body.data.password) {
            res.status(400).send({message: "Invalid or incorrect old password!"});
        }

        if (req.body.data ?. oldPassword && req.body.data.password) {
            const isMatch = bcrypt.compareSync(req.body.data.oldPassword, admin.password);
            console.log(">>>>>>>> pass  --- oioi ", isMatch);

            if (! isMatch) {
                return res.status(400).send({message: "Invalid or incorrect old password!"});
            }
            dataToUpdate.password = bcrypt.hashSync(req.body.data.password);
        }

        // update admin
        await admin.update(dataToUpdate);

        // Remove old image if new image is different
        // if (oldImageFilename && oldImageFilename !== filename) {
        // const oldImagePath = path.join(__dirname, "../upload", oldImageFilename);

        // if (fs.existsSync(oldImagePath)) {
        //     fs.unlink(oldImagePath, (err) => {
        //       if (err) {
        //         console.error("Failed to delete old image:", err);
        //       } else {
        //         console.log("Old image successfully deleted:", oldImagePath);
        //       }
        //     });
        // } else {
        //     console.log("File does not exist:", oldImagePath);
        // }
        // }

        const token = signInToken(admin);
        res.send({
            token,
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            phone: admin.phone,
            // image: admin.image,
            joiningDate: admin.joiningDate
        });
    } catch (err) {
        console.error("errrrrrrrrrrrrrrrr  --------- ", err);
        res.status(500).send(err.message);
    }
};

const deleteStaff = async (req, res) => {
    try { // Find the admin by ID
        const admin = await Admin.findByPk(req.params.id);
        if (! admin) {
            return res.status(404).send({message: "Admin Not Found!"});
        }

        // Delete the admin record
        const deletedAdmin = await Admin.destroy({
            where: {
                id: req.params.id
            }
        });

        if (deletedAdmin) {
            res.status(200).send({message: "Admin Deleted Successfully!"});
        } else {
            res.status(404).send({message: "Admin Not Found!"});
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({message: err.message});
    }
};
module.exports = {
    registerAdmin,
    loginAdmin,
    forgetPassword,
    resetPassword,
    addStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff
};
