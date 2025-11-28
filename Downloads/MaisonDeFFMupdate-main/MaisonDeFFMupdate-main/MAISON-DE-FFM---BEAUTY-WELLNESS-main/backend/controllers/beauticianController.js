const Beautician = require('../models/Beautician');
const errorHandler = require('../middleware/errorHandler.js');

// List active beauticians for selection/tracking
exports.getAllBeauticians = async (req, res) => {
  try {
    const beauticians = await Beautician.find({ isActive: true })
      .select('name specialization phone email');

    res.json({
      success: true,
      count: beauticians.length,
      beauticians,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error fetching beauticians', error);
  }
};

// Get single beautician
exports.getBeauticianById = async (req, res) => {
  try {
    const beautician = await Beautician.findById(req.params.id);
    if (!beautician || !beautician.isActive) {
      return errorHandler(res, 404, 'Beautician not found');
    }
    res.json({ success: true, beautician });
  } catch (error) {
    errorHandler(res, 500, 'Error fetching beautician', error);
  }
};
