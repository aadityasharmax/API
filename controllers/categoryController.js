const Category = require('../models/categoryModel');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: 1 }).populate('parent', 'name'); // include parent name
    res.json(categories);
  } 
  
  catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};