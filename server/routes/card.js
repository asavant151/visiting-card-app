const express = require('express');
const router = express.Router();
const { createCard, getMyCards, getCardById, updateCard, deleteCard, getPublicCard, trackAnalytics } = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.get('/public/:slug', getPublicCard);
router.post('/:id/analytics', trackAnalytics);

router.post('/create', protect, createCard);
router.get('/my-cards', protect, getMyCards);
router.get('/:id', protect, getCardById);
router.put('/:id', protect, updateCard);
router.delete('/:id', protect, deleteCard);

module.exports = router;
