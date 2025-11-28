const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');

// Public endpoints needed by Promos page
router.get('/', promoController.getAllPromos);
router.get('/:id', promoController.getPromoById);

module.exports = router;
