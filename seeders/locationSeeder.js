const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Location = require('../models/locationModel');

dotenv.config();

// Slug generator
const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-');

const rawLocations = [
  'Serrekunda', 'Banjul', 'Brikama', 'Bakau', 'Westfield',
  'Senegambia', 'Turntable', 'Latrikunda', 'Brusubi', 'Bijilo',
  'Wellingara', 'Tallinding', 'Fajara', 'Pipeline', 'Sukuta', 'Bakoteh'
];

const locations = rawLocations.map(name => ({
  name,
  slug: slugify(name),
  image: 'www.imge.com',
  status: 1,
  description: `${name} is a location in The Gambia.`
}));

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Location.deleteMany();
    await Location.insertMany(locations);

    console.log('Locations seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding locations:', err.message);
    process.exit(1);
  }
};

seedLocations();
