require('dotenv').config();
const connectDB = require('./config/db');

const User = require('./models/User');
const userData = require('./utils/user');
const Admin = require('./models/Admin');
const adminData = require('./utils/admin');
const Coupon = require('./models/Coupon');
const couponData = require('./utils/coupon');
const productData = require('./utils/products');
const Product = require('./models/Product');
const Category = require('./models/Category');
const categoryData = require('./utils/category');

// connectDB();

connectDB.sync().then(() => {
  console.log('Database connected!');
}).catch((err) => {
  console.log('Database connection failed!', err.message);
});

const importData = async () => {
  try {
    // Delete existing data
    await User.destroy({ where: {} });
    await Admin.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Coupon.destroy({ where: {} });
  
    // Insert new data
    await User.bulkCreate(userData);
    await Admin.bulkCreate(adminData);
    await Product.bulkCreate(productData);
    await Category.bulkCreate(categoryData);
    await Coupon.bulkCreate(couponData);

    console.log('data inserted successfully!');
    process.exit();
  } catch (error) {
    console.log('error', error);
    process.exit(1);
  }
};

importData();
