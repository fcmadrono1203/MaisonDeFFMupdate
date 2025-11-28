const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Public endpoints needed by Services page
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

module.exports = router;
