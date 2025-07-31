const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  signUpWithProvider,
  verifyEmailAddress,
  forgetPassword,
  changePassword,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  updateUserStatus,
  verifyEmailToken,
  addUser,
} = require('../controller/userController');
const {
  passwordVerificationLimit,
  emailVerificationLimit,
} = require('../config/others');

//verify email
// router.post('/verify-email', emailVerificationLimit, verifyEmailAddress);

//register a user
router.post('/register', registerUser);

//add a user
router.post('/add', addUser);

router.post("/verify-email", emailVerificationLimit, verifyEmailAddress);
router.get("/email-verification/:token", verifyEmailToken);
// router.post('/register/:token', registerUser);

//login a user
router.post('/login', loginUser);

//register or login with google and fb
router.post('/signup', signUpWithProvider);

// //forget-password
// router.put('/forget-password', passwordVerificationLimit, forgetPassword);

// //reset-password
// router.put('/reset-user-password', passwordVerificationLimit, resetUserPassword);

//forget-password
router.put('/forget-password', forgetPassword);

//reset-password
router.put('/reset-user-password', resetUserPassword);


//reset-password
router.put('/reset-password', resetPassword);

//change password
router.post('/change-password', changePassword);

//get all user
router.get('/', getAllUsers);

//get a user
router.get('/:id', getUserById);

//update a user
router.put('/:id', updateUser);

//update user status
router.put('/status/:id', updateUserStatus);

//delete a user
router.delete('/:id', deleteUser);

module.exports = router;
