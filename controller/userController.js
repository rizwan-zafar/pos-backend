require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { signInToken, tokenForVerify, sendEmail } = require("../config/auth");

// const verifyEmailAddress = async (req, res) => {
//   try {
//     const existingUser = await User.findOne({
//       where: { email: req.body.email },
//     });

//     if (existingUser) {
//       return res.status(403).send({
//         message: "This Email already Added!",
//       });
//     } else {
//       const token = tokenForVerify(req.body);

//       // Create User record in the database
//       const newUser = await User.create({
//         email: req.body.email,
//         // Other relevant fields from req.body
//       });

//       const body = {
//         from: `"Lidrah Team" <${process.env.EMAIL_USER}>`,
//         to: req.body.email,
//         subject: "Email Activation",
//         html: `<h2>Hello ${req.body.email}</h2>
//         <p>Verify your email address to complete the signup and login into your <strong>SardarStore</strong> account.</p>

//         <p>This link will expire in <strong>15 minute</strong>.</p>

//         <p style="margin-bottom:20px;">Click this link for active your account</p>

//         <a href="${process.env.STORE_URL}/user/email-verification/${token}" style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Account</a>

//         <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@sardarstore.com</p>

//         <p style="margin-bottom:0px;">Thank you</p>
//         <strong>SardarStore Team</strong>
//                `,
//       };

//       const message = "Please check your email to verify!";
//       sendEmail(body, res, message);
//     }
//   } catch (error) {
//     console.error("Error occurred:", error);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// };

// const registerUser = async (req, res) => {
//   // console.log('hello g');
//   // const token = req.params.token;
//   // const { name, email, password } = jwt.decode(token);
//   // console.log('--------token', token);

//   const { name, email, password } = req.body;
//   try {
//     const existingUser = await User.findOne({ where: { email: email } });

//     if (existingUser) {
//       const token = signInToken(existingUser);
//       return res.send({
//         token,
//         user: existingUser,
//         // name: existingUser.name,
//         // email: existingUser.email,
//         message: "Email Already Verified!",
//       });
//     }

//     // if (token) {
//     //   jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY, async (err, decoded) => {
//     //     if (err) {
//     //       return res.status(401).send({
//     //         message: 'Token Expired, Please try again!',
//     //       });
//     //     } else {
//     const newUser = await User.create({
//       name,
//       email,
//       password: bcrypt.hashSync(password),
//     });

//     // console.log(newUser);

//     const token = signInToken(newUser);
//     res.send({
//       token,
//       user: newUser,
//       // _id: newUser.id,
//       // name: newUser.name,
//       // email: newUser.email,
//       message: "User Signup Successfully!",
//       // message: 'Email Verified, Please Login Now!',
//     });
//     // }
//     // }
//     // );
//     // }
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).send({
//       message: "An error occurred while registering the user.",
//     });
//   }
// };

const verifyEmailAddress = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(403).send({
        message: "This email is already registered! Please log in.",
      });
    }

    // Generate token for email verification
    const token = jwt.sign({ email }, process.env.JWT_SECRET_FOR_VERIFY, {
      expiresIn: "15m", // Token expires in 15 minutes
    });

    // Create user with default unverified status
    const newUser = await User.create({
      email,
      isVerified: false, // Default to false until verified
    });

    // Email body
    const body = {
      from: `"Lidrah Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification",
      html: `
       <div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
  <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:linear-gradient(41,29,26,41,29,26 30%,178,103,75 105%,51,51,51 65%);">
    
    <!-- Header -->
    <div style="text-align:center;padding:40px 20px 20px;">
      <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
      <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
    </div>

    <!-- Hero -->
    <div style="background:rgba(0,0,0,0.5);padding:60px 20px;text-align:center;">
      <h1 style="font-size:32px;margin:0;color:rgb(178,103,75);">Verify Your Email</h1>
      <h2 style="font-size:20px;margin:10px 0 0;color:#ffffff;">Hello ${email}</h2>
    </div>

    <!-- Content -->
    <div style="background-color:rgba(0,0,0,0.4);padding:40px 20px;text-align:center;">
      <h2 style="font-size:24px;color:#ffffff;margin-bottom:20px;">Welcome Back to Lidrah</h2>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        You previously signed up for Lidrah but haven't verified your email yet.
        Please confirm your email address to complete your registration.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        This link will expire in <strong>15 minutes</strong>.
      </p>
      <a href="${
        process.env.STORE_URL
      }/user/email-verification/${token}?user_id=${
        newUser.id
      }&token=${token}" 
         style="display:inline-block;background-color:rgb(178,103,75);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:5px;margin-top:20px;">
        Verify Account
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>

    <!-- About -->
    <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
      <p><strong>Why Lidrah?</strong><br>
        We craft premium leather goods that are elegant, enduring, and unmistakably yours. Our materials are ethically sourced and handcrafted to perfection. Be part of the journey.</p>
    </div>

    <!-- Footer -->
    <div style="background-color:rgba(41,29,26,0.9);color:#aaa;text-align:center;padding:30px 20px;font-size:13px;">
      <p style="margin:0 0 20px;color:#d1b8a3;font-size:14px;">
        &copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.
      </p>
      <p style="margin:0 0 20px;">
        <a href="https://www.lidrah.com" style="color:wheat;text-decoration:none;margin:0 12px;">Visit Store</a>|
        <a href="https://www.lidrah.com/privacy" style="color:wheat;text-decoration:none;margin:0 12px;">Privacy Policy</a>|
        <a href="https://www.lidrah.com/contact-us" style="color:wheat;text-decoration:none;margin:0 12px;">Contact Us</a>
      </p>
      <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">
        You received this email because you signed up at <a href="https://www.lidrah.com" style="color:wheat;font-weight:bold;text-decoration:none;">lidrah.com</a>.<br>
        If this wasn’t you, you can ignore this message.
      </p>
    </div>

  </div>
</div>
      `,
    };

    // Send email
    const message = "Please check your email to verify!";
    sendEmail(body, res, message);
  } catch (error) {
    console.error("Error occurred during email verification:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.params;
    // console.log(token ,">>>>>>>>>>>>>>>>>>>>>>");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY);

    // Find the user by email
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(200).send({ message: "User already verified." });
    }

    // Update user's verification status
    user.isVerified = true;
    await user.save();

    res.send({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).send({ message: "Invalid or expired token." });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    // If user exists
    if (existingUser) {
      // If user is not verified
      if (!existingUser.isVerified) {
        const token = jwt.sign(
          { email: existingUser.email },
          process.env.JWT_SECRET_FOR_VERIFY,
          { expiresIn: "15m" }
        );

        // Send verification email
        const body = {
          from: `"Lidrah Team" <${process.env.EMAIL_USER}>`,
          to: existingUser.email,
          subject: "Email Verification",
          html: `
             <div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
  <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:linear-gradient(41,29,26,41,29,26 30%,178,103,75 105%,51,51,51 65%);">
    
    <!-- Header -->
    <div style="text-align:center;padding:40px 20px 20px;">
      <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
      <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
    </div>

    <!-- Hero -->
    <div style="background:rgba(0,0,0,0.5);padding:60px 20px;text-align:center;">
      <h1 style="font-size:32px;margin:0;color:rgb(178,103,75);">Complete Your Signup</h1>
      <h2 style="font-size:20px;margin:10px 0 0;color:#ffffff;">${
        existingUser.email
      }</h2>
    </div>

    <!-- Content -->
    <div style="background-color:rgba(0,0,0,0.4);padding:40px 20px;text-align:center;">
      <h2 style="font-size:24px;color:#ffffff;margin-bottom:20px;">Welcome Back to Lidrah</h2>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        It looks like you've already signed up, but your email address is still unverified.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        To access your account and start exploring our premium leather goods, please verify your email.
        This link will expire in <strong>15 minutes</strong>.
      </p>
      <a href="${
        process.env.STORE_URL
      }/user/email-verification/${token}?user_id=${
            existingUser.id
          }&token=${token}"
         style="display:inline-block;background-color:rgb(178,103,75);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:5px;margin-top:20px;">
        Verify Email
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>

    <!-- About -->
    <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
      <p><strong>Why Lidrah?</strong><br>
        We craft premium leather goods that are elegant, enduring, and unmistakably yours. Our materials are ethically sourced and handcrafted to perfection. Be part of the journey.</p>
    </div>

    <!-- Footer -->
    <div style="background-color:rgba(41,29,26,0.9);color:#aaa;text-align:center;padding:30px 20px;font-size:13px;">
      <p style="margin:0 0 20px;color:#d1b8a3;font-size:14px;">
        &copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.
      </p>
      <p style="margin:0 0 20px;">
        <a href="https://www.lidrah.com" style="color:wheat;text-decoration:none;margin:0 12px;">Visit Store</a> |
        <a href="https://www.lidrah.com/privacy" style="color:wheat;text-decoration:none;margin:0 12px;">Privacy Policy</a> |
        <a href="https://www.lidrah.com/contact-us" style="color:wheat;text-decoration:none;margin:0 12px;">Contact Us</a>
      </p>
      <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">
        You received this email because a signup attempt was made using this email at
        <a href="https://www.lidrah.com" style="color:wheat;font-weight:bold;text-decoration:none;">lidrah.com</a>.<br>
        If this wasn’t you, you can safely ignore this message.
      </p>
    </div>

  </div>
</div>
          `,
        };

        const message = "Please check your email to verify!";
        sendEmail(body, res, message);

        return; // Exit function
      }

      // If user is already registered and verified
      const token = signInToken(existingUser);
      return res.send({
        token,
        user: existingUser,
        isVerified: existingUser.isVerified,
        message: "User already registered!",
        showMessage: "closeModal",
      });
    }

    // If user does not exist, create a new one
    const newUser = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password),
      isVerified: false,
    });

    // Generate email verification token
    const token = jwt.sign(
      { email: newUser.email },
      process.env.JWT_SECRET_FOR_VERIFY,
      { expiresIn: "15m" }
    );

    const body = {
      from: `"Lidrah Team" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "Email Verification",
      html: `
 <div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
    <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:linear-gradient(41,29,26,41,29,26 30%,178,103,75 105%,51,51,51 65%);">
      
      <!-- Header -->
      <div style="text-align:center;padding:40px 20px 20px;">
        <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
        <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
      </div>

      <!-- Hero -->
      <div style="background:rgba(0,0,0,0.5);padding:60px 20px;text-align:center;">
        <h1 style="font-size:36px;margin:0;color:rgb(178,103,75);">Confirm Your Email</h1>
        <h1 style="font-size:24px;margin:10px 0 0;color:#ffffff;">${
          newUser.email
        }</h1>
      </div>

      <!-- Content -->
      <div style="background-color:rgba(0,0,0,0.4);padding:40px 20px;text-align:center;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:20px;">Welcome to Lidrah</h2>
        <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
          Thank you for signing up! You're one step away from unlocking timeless craftsmanship and exclusive leather products.
        </p>
        <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
          Click below to verify your email address and activate your account.
        </p>
        <a href="${
          process.env.STORE_URL
        }/user/email-verification/${token}?user_id=${
        newUser.id
      }&token=${token}"
           style="display:inline-block;background-color:rgb(178,103,75);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:5px;margin-top:20px;">
          Verify Email
        </a>
      </div>

      <!-- Divider -->
      <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>

      <!-- About -->
      <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
        <p><strong>Why Lidrah?</strong><br>
          We craft premium leather goods that are elegant, enduring, and unmistakably yours. Our materials are ethically sourced and handcrafted to perfection. Be part of the journey.</p>
      </div>

      <!-- Footer -->
      <div style="background-color:rgba(41,29,26,0.9);color:#aaa;text-align:center;padding:30px 20px;font-size:13px;">
        <p style="margin:0 0 20px;color:#d1b8a3;font-size:14px;">
          &copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.
        </p>
        <p style="margin:0 0 20px;">
          <a href="https://www.lidrah.com" style="color:wheat;text-decoration:none;margin:0 12px;">Visit Store</a>|
          <a href="https://www.lidrah.com/privacy" style="color:wheat;text-decoration:none;margin:0 12px;">Privacy Policy</a>|
          <a href="https://www.lidrah.com/contact-us" style="color:wheat;text-decoration:none;margin:0 12px;">Contact Us</a>
        </p>
        <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">
          You received this email because you created an account at <a href="https://www.lidrah.com" style="color:wheat;font-weight:bold;text-decoration:none;">lidrah.com</a>.<br>
          If this wasn’t you, you can ignore this message.
        </p>
      </div>

    </div>
  </div>
  `,
    };

    const message = "Please check your email to verify!";
    sendEmail(body, res, message);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({
      message: "An error occurred during signup.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password!",
      });
    }

    // Check if user is not verified
    if (!user.isVerified) {
      const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET_FOR_VERIFY,
        {
          expiresIn: "15m",
        }
      );

      // Send verification email
      const body = {
        from: `"Lidrah Team" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Verify Your Email Address",
        html: `
          <div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
  <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:linear-gradient(41,29,26,41,29,26 30%,178,103,75 105%,51,51,51 65%);">
    
    <!-- Header -->
    <div style="text-align:center;padding:40px 20px 20px;">
      <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
      <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
    </div>

    <!-- Hero -->
    <div style="background:rgba(0,0,0,0.5);padding:60px 20px;text-align:center;">
      <h1 style="font-size:32px;margin:0;color:rgb(178,103,75);">Email Verification Required</h1>
      <h2 style="font-size:20px;margin:10px 0 0;color:#ffffff;">Hello ${
        user.name || "User"
      }</h2>
    </div>

    <!-- Content -->
    <div style="background-color:rgba(0,0,0,0.4);padding:40px 20px;text-align:center;">
      <h2 style="font-size:24px;color:#ffffff;margin-bottom:20px;">Verify to Access Your Account</h2>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        You attempted to log in, but your email is not verified yet.
        Please confirm your email address to proceed and access your Lidrah account.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        This link will expire in <strong>15 minutes</strong>.
      </p>
      <a href="${
        process.env.STORE_URL
      }/user/email-verification/${token}?user_id=${
          user.id
        }&token=${token}"
         style="display:inline-block;background-color:rgb(178,103,75);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:5px;margin-top:20px;">
        Verify Account
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>

    <!-- About -->
    <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
      <p><strong>Why Lidrah?</strong><br>
        We craft premium leather goods that are elegant, enduring, and unmistakably yours. Our materials are ethically sourced and handcrafted to perfection. Be part of the journey.</p>
    </div>

    <!-- Footer -->
    <div style="background-color:rgba(41,29,26,0.9);color:#aaa;text-align:center;padding:30px 20px;font-size:13px;">
      <p style="margin:0 0 20px;color:#d1b8a3;font-size:14px;">
        &copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.
      </p>
      <p style="margin:0 0 20px;">
        <a href="https://www.lidrah.com" style="color:wheat;text-decoration:none;margin:0 12px;">Visit Store</a>|
        <a href="https://www.lidrah.com/privacy" style="color:wheat;text-decoration:none;margin:0 12px;">Privacy Policy</a>|
        <a href="https://www.lidrah.com/contact-us" style="color:wheat;text-decoration:none;margin:0 12px;">Contact Us</a>
      </p>
      <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;">
        If you did not initiate this request, please contact us immediately at 
        <a href="mailto:support@lidrah.com" style="color:wheat;font-weight:bold;text-decoration:none;">support@lidrah.com</a>.
      </p>
    </div>

  </div>
</div>
        `,
      };

      // sendEmail(body, res, "Verification email sent. Please check your inbox.");
      // sendEmail(body, res, "Your email is not verified. A verification link has been sent to your email address. Please check your email to verify!");
      sendEmail(
        body,
        res,
        "Your email is not verified. We've sent a verification link to your email address. Please check your inbox to complete the verification process."
      );
      // return res.status(403).json({
      //   message:
      //     "Your email is not verified. A verification link has been sent to your email address.",
      // });
      return;
    }

    // Check if user is blocked
    if (user.status !== "active") {
      return res.status(403).send({
        message:
          "Oops! It looks like your account is temporarily blocked. Please reach out to our support team.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordValid) {
      const token = signInToken(user);
      res.send({
        token,
        user: user,
        message: "Sigin Successfully!",
        success: true,
      });
    } else {
      res.status(401).send({
        message: "Invalid email or password!",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

// const loginUser = async (req, res) => {
//   try {
//     const user = await User.findOne({
//       where: { email: req.body.email },
//     });

// if (!user) {
//   return res.status(404).json({
//     message: "Invalid email or password!",
//   });
// }

// if (user && user.password) {

//   const isPasswordValid = await bcrypt.compare(
//     req.body.password,
//     user.password
//   );

//   if (isPasswordValid) {

//    if (isPasswordValid && user.status !== 'active') {
//     return res.status(403).send({
//       message:
//         "Oops! It looks like your account is temporarily blocked. Please reach out to our support team.",
//     });
//   }
//     const token = signInToken(user);
//     res.send({
//       token,
//       user: user,
//     });
//   } else {
//     res.status(401).send({
//       message: "Invalid email or password!",
//     });
//   }
// }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({
//       message: "Internal server error",
//     });
//   }
// };
//////////// forget paswd email

const forgetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.verifyEmail } });
    // console.log("hello forget ", user);

    if (!user) {
      return res.status(404).send({
        message: "User Not found with this email!",
      });
    } else {
      const token = tokenForVerify(user);
      const body = {
        from: `"Lidrah Team" <${process.env.EMAIL_USER}>`,
        to: req.body.verifyEmail,
        subject: "Password Reset",
        html: `<div style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;color:#ffffff;background:#000 url('https://backend.lidrah.com/upload/bg1.png') no-repeat center center;background-size:cover;">
  <div style="width:100%;max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;background:linear-gradient(41,29,26,41,29,26 30%,178,103,75 105%,51,51,51 65%);">
    
    <!-- Header -->
    <div style="text-align:center;padding:40px 20px 20px;">
      <img src="https://lidrah.vercel.app/assets/images/logo.png" alt="Lidrah Logo" style="max-height:145px;" />
      <p style="margin:-29px 0 0;color:#ffffff;font-size:16px;">Where Leather Meets Legacy</p>
    </div>

    <!-- Hero -->
    <div style="background:rgba(0,0,0,0.5);padding:60px 20px;text-align:center;">
      <h1 style="font-size:32px;margin:0;color:rgb(178,103,75);">Reset Your Password</h1>
      <h2 style="font-size:20px;margin:10px 0 0;color:#ffffff;">Hello ${
        req.body.verifyEmail
      }</h2>
    </div>

    <!-- Content -->
    <div style="background-color:rgba(0,0,0,0.4);padding:40px 20px;text-align:center;">
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        We received a request to reset the password for your <strong>Lidrah</strong> account.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        This link will expire in <strong>15 minutes</strong>.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#e0e0e0;margin:0 auto 20px;max-width:550px;">
        Click the button below to reset your password:
      </p>
      <a   href="${process.env.STORE_URL}/user/reset-password/${token}?user_id=${user.id}&token=${token}" 
         style="display:inline-block;background-color:rgb(178,103,75);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:5px;margin-top:20px;">
        Reset Password
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px;background-color:#555;margin:40px auto;width:80%;"></div>

    <!-- Footer -->
    <div style="padding:20px;text-align:center;color:#ccc;font-size:15px;line-height:1.5;max-width:650px;margin:auto;">
      <p>If you did not initiate this request, please contact us immediately at 
        <a href="mailto:support@lidrah.com" style="color:wheat;font-weight:bold;text-decoration:none;">support@lidrah.com</a>.
      </p>
      <p style="margin-top:30px;">Thank you,</p>
      <strong style="color:#fff;">The Lidrah Team</strong>
    </div>

    <!-- Footer Bar -->
    <div style="background-color:rgba(41,29,26,0.9);color:#aaa;text-align:center;padding:30px 20px;font-size:13px;">
      <p style="margin:0 0 20px;color:#d1b8a3;font-size:14px;">
        &copy; ${new Date().getFullYear()} <strong style="color:#fff;">Lidrah</strong>. All rights reserved.
      </p>
      <p style="margin:0 0 20px;">
        <a href="https://www.lidrah.com" style="color:wheat;text-decoration:none;margin:0 12px;">Visit Store</a>|
        <a href="https://www.lidrah.com/privacy" style="color:wheat;text-decoration:none;margin:0 12px;">Privacy Policy</a>|
        <a href="https://www.lidrah.com/contact-us" style="color:wheat;text-decoration:none;margin:0 12px;">Contact Us</a>
      </p>
    </div>

  </div>
</div>       `,
      };
      // <a href=${process.env.STORE_URL}/user/forget-password/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>

      const message = "Please check your email to reset password!";
      sendEmail(body, res, message);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

//////////////// resetUserPassword - forget pswd

const resetUserPassword = async (req, res) => {
  const { token, user_id, password } = req.body;

  console.log(token);
  console.log(user_id);
  console.log(password);

  if (!token || !user_id || !password) {
    return res
      .status(400)
      .json({ message: "Token, User ID, and password are required" });
  }
  // Verify the token
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // if (decoded._id !== parseInt(user_id, 10)) {
  //   return res.status(401).json({ message: 'Invalid token or user ID' });
  // }

  const decodedToken = jwt.decode(token);

  if (!decodedToken) {
    return res.status(400).send({
      message: "Invalid token!",
    });
  }

  try {
    const user = await User.findOne({ where: { email: decodedToken.email } });

    if (!user) {
      return res.status(404).send({
        message: "User not found!",
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_FOR_VERIFY,
      async (err, decoded) => {
        if (err) {
          return res.status(500).send({
            message: "Token expired, please try again!",
          });
        } else {
          // Hash the new password
          const hashedPassword = bcrypt.hashSync(password);

          // Update the user's password in the database
          await user.update({ password: hashedPassword });

          res.send({
            message:
              "Your password has been changed successfully. You can now login!",
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  const token = req.body.token;
  const decodedToken = jwt.decode(token);

  if (!decodedToken) {
    return res.status(400).send({
      message: "Invalid token!",
    });
  }

  try {
    const user = await User.findOne({ where: { email: decodedToken.email } });

    if (!user) {
      return res.status(404).send({
        message: "User not found!",
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET_FOR_VERIFY,
      async (err, decoded) => {
        if (err) {
          return res.status(500).send({
            message: "Token expired, please try again!",
          });
        } else {
          // Hash the new password
          const hashedPassword = bcrypt.hashSync(req.body.newPassword);

          // Update the user's password in the database
          await user.update({ password: hashedPassword });

          res.send({
            message:
              "Your password has been changed successfully. You can now login!",
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).send({
        message: "User not found!",
      });
    }

    if (!user.password) {
      return res.send({
        message:
          "To change the password, you need to sign in with your current password!",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (isPasswordValid) {
      // Hash the new password
      const hashedPassword = bcrypt.hashSync(req.body.newPassword);

      // Update the user's password in the database
      await user.update({ password: hashedPassword });

      res.send({
        message: "Your password has been changed successfully!",
      });
    } else {
      res.status(401).send({
        message: "Invalid email or current password!",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const signUpWithProvider = async (req, res) => {
  try {
    // Check if the user already exists
    const isAdded = await User.findOne({ where: { email: req.body.email } });

    if (isAdded) {
      // If the user exists, generate token and send user data
      const token = signInToken(isAdded);
      res.send({
        token,
        _id: isAdded._id,
        name: isAdded.name,
        email: isAdded.email,
        address: isAdded.address,
        phone: isAdded.phone,
        image: isAdded.image,
      });
    } else {
      // If the user doesn't exist, create a new user
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
      });

      // Generate token for the new user
      const token = signInToken(newUser);

      // Send response with token and user data
      res.send({
        token,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
      });
    }
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send({
      message: err.message,
    });
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["id", "DESC"]],
    });
    // console.log(users);
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// const getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     res.send(user);
//   } catch (err) {
//     res.status(500).send({
//       message: err.message,
//     });
//   }
// };

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// const updateUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (user) {
//       user.name = req.body.name;
//       user.email = req.body.email;
//       user.address = req.body.address;
//       user.phone = req.body.phone;
//       user.image = req.body.image;
//       const updatedUser = await user.save();
//       const token = signInToken(updatedUser);
//       res.send({
//         token,
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         address: updatedUser.address,
//         phone: updatedUser.phone,
//         image: updatedUser.image,
//       });
//     }
//   } catch (err) {
//     res.status(404).send({
//       message: 'Your email is not valid!',
//     });
//   }
// };

const updateUser = async (req, res) => {
  console.log(">>>>>>>>>>>>>>. id", req.body);

  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;
      user.address = req.body.address;
      user.phone = req.body.phone;
      user.rawAddress = req.body.rawAddress;

      // user.image = req.body.image;

      const updatedUser = await user.save();

      const token = signInToken(updatedUser);

      // console.log('Updated User:', updatedUser);
      // console.log('Success:', success);

      let response = {
        user: updatedUser,
        success: true,
        token: token,
      };
      // console.log('response:', response);

      // Send the response
      res.send(response);
      // res.send({
      //   token,
      //   _id: updatedUser._id,
      //   name: updatedUser.name,
      //   email: updatedUser.email,
      //   address: updatedUser.address,
      //   phone: updatedUser.phone,
      //   image: updatedUser.image,
      //   success:true
      // });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(404).send({
      message: "Your email is not valid!",
    });
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, isVerified } = req.body;

  // validation
  if (status && !["active", "block"].includes(status)) {
    return res
      .status(400)
      .json({ message: 'Invalid status value. Use "active" or "block".' });
  }

  if (isVerified !== undefined && !["true", "false"].includes(isVerified)) {
    return res
      .status(400)
      .json({ message: 'Invalid isVerified value. Use "true" or "false".' });
  }

  try {
    const updateFields = {};
    if (status) updateFields.status = status;
    if (isVerified !== undefined)
      updateFields.isVerified = isVerified === "true";

    // update user
    const updated = await User.update(updateFields, { where: { id } });

    if (updated[0] === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: `User updated successfully.`,
      updatedFields: updateFields,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user.", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  // console.log("delete>>>>>>>>>>>>>>> ", req.params.id);

  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (user) {
      await user.destroy();
      res.status(200).json({ message: "User Deleted Successfully!" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  loginUser,
  registerUser,
  verifyEmailToken,
  verifyEmailAddress,
  signUpWithProvider,
  forgetPassword,
  changePassword,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  resetUserPassword,
};
