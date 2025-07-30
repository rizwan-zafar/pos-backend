const express = require('express');
const router = express.Router();
// const upload = require('../config/multerConfig')
const {
  addCategory,
  addAllCategory, 
  getAllCategory,
  getShowingCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
} = require('../controller/categoryController');

//add a category
// router.post('/add', upload.single('icon') , addCategory);
router.post('/add' , addCategory);

//add all category
router.post('/all', addAllCategory);

//get only showing category
router.get('/show', getShowingCategory);

//get all category
router.get('/', getAllCategory);

//get a category
router.get('/:id', getCategoryById);

//update a category
// router.put('/:id',upload.single('icon'), updateCategory);
router.put('/:id', updateCategory);

//show/hide a category
router.put('/status/:id', updateStatus);

//delete a category
// router.patch('/:id', deleteCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
