const express = require('express');
const router = express.Router();
const beauticianController = require('../controllers/beauticianController');

// Public endpoints used by Beautician page / booking
router.get('/', beauticianController.getAllBeauticians);
router.get('/:id', beauticianController.getBeauticianById);

module.exports = router;
