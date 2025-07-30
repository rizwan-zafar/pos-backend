// const Coupon = require('../models/Coupon');
// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// dayjs.extend(utc);

// const addCoupon = async (req, res) => {
//   try {
//     // Assuming Coupon is your Sequelize model for coupons
//     const newCoupon = await Coupon.create(req.body); //
//     res.send({ message: 'Coupon Added Successfully!' });
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// };

// const addAllCoupon = async (req, res) => {
//   try {
//     const coupons = req.body;
//     await Coupon.bulkCreate(coupons); //
//     res.status(200).send({
//       message: 'Coupons Added successfully!',
//     });
//   } catch (err) {
//     res.status(500).send({
//       message: err.message,
//     });
//   }
// };

// const getAllCoupons = async (req, res) => {
//   try {
//     const coupons = await Coupon.findAll({ //
//       order: [['id', 'DESC']] // Sort by id in descending order
//     });
//     res.send(coupons);
//   } catch (err) {
//     res.status(500).send({
//       message: err.message,
//     });
//   }
// };;


// const getCouponById = async (req, res) => {
//   try {
//     const coupon = await Coupon.findOne({ //
//       where: {
//         id: req.params.id
//       }
//     });
//     if (!coupon) {
//       res.status(404).send({ message: 'Coupon not found' });
//       return;
//     }
//     res.send(coupon);
//   } catch (err) {
//     res.status(500).send({
//       message: err.message,
//     });
//   }
// };

// const updateCoupon = async (req, res) => {
//   try {
//     const coupon = await Coupon.findByPk(req.params.id); //
//     if (coupon) {
//       // Update coupon attributes
//       coupon.title = req.body.title;
//       coupon.couponCode = req.body.couponCode;
//       coupon.endTime = req.body.endTime;
//       coupon.discountPercentage = req.body.discountPercentage;
//       coupon.minimumAmount = req.body.minimumAmount;
//       coupon.productType = req.body.productType;
//       coupon.logo = req.body.logo;
      
//       // Save changes to the database
//       await coupon.save();
      
//       res.send({ message: 'Coupon Updated Successfully!' });
//       return;
//     }
//     res.status(404).send({ message: 'Coupon not found!' });
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// };

// const deleteCoupon = async (req, res) => {
//   try {
//     const deletedRows = await Coupon.destroy({ //
//       where: {
//         id: req.params.id
//       }
//     });
//     if (deletedRows === 0) {
//       res.status(404).send({ message: 'Coupon not found!' });
//       return;
//     }
//     res.status(200).send({ message: 'Coupon Deleted Successfully!' });
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// };

// module.exports = {
//   addCoupon,
//   addAllCoupon,
//   getAllCoupons,
//   getCouponById,
//   updateCoupon,
//   deleteCoupon,
// };
