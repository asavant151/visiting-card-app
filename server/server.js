const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/card', require('./routes/card'));
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/admin', require('./routes/admin'));

// Upload routes (for general image uploads like logo)
app.post('/api/upload', require('./middleware/upload').single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
        const cloudinary = require('./config/cloudinary');
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        const cldRes = await cloudinary.uploader.upload(dataURI, { folder: 'visiting_cards' });
        res.json({ imageUrl: cldRes.secure_url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
