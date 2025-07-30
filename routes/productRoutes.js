const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getShowingProducts,
  getDiscountedProducts,
  getStockOutProducts,
  getProductById,
  getProductBySlug,
  addProduct,
  addAllProducts,
  updateProduct,
  updateStatus,
  deleteProduct,
  getProductsByCategory,
  _getAllProducts
} = require('../controller/productController');

//add a product
router.post('/add', addProduct);

//add multiple products
router.post('/all', addAllProducts);

//get a product
router.get('/product/:id', getProductById);

//get showing products only
router.get('/show', getShowingProducts);

//get discounted products only
router.get('/discount', getDiscountedProducts);
 
//get all products
router.get('/', getAllProducts);
//get all products
router.get('/all', _getAllProducts);

//get all stock out products
router.get('/stock-out', getStockOutProducts);

//get a product by slug
router.get('/:slug', getProductBySlug);

//get a product by category
router.get('/bycategory/:categoryId', getProductsByCategory);

//update a product
router.put('/:id', updateProduct);

//update a product status
router.put('/status/:id', updateStatus);

//delete a product
router.delete('/:id', deleteProduct);

module.exports = router;
