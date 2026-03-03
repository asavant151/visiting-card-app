const express = require('express');
const router = express.Router();
const { extractData } = require('../controllers/ocrController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/extract', protect, upload.single('image'), extractData);

module.exports = router;
