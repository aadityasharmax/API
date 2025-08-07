const Location = require('../models/locationModel');

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};