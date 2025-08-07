const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const dotenv = require('dotenv');

dotenv.config();

const categories = [
  {
    name: 'Phones',
    slug: 'phones',
    status: 1,
    image: '',
    parent: null,
    description: 'Mobile phones, smartphones and accessories'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    status: 1,
    image: '',
    parent: null,
    description: 'Clothing, shoes, and accessories'
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    status: 1,
    image: '',
    parent: null,
    description: 'TVs, gadgets, laptops and more'
  }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log('Categories seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedCategories();
