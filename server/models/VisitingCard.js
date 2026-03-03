const mongoose = require('mongoose');

const visitingCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    frontImage: {
        type: String, // Cloudinary URL
    },
    backImage: {
        type: String, // Cloudinary URL
    },
    logo: {
        type: String, // Base64 or URL
    },
    name: {
        type: String,
    },
    designation: {
        type: String,
    },
    company: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    website: {
        type: String,
    },
    address: {
        type: String,
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'gradient'],
        default: 'light',
    },
    layoutType: {
        type: String,
        enum: ['horizontal', 'vertical', 'square', 'linkedin', 'nfc'],
        default: 'horizontal',
    },
    fontFamily: {
        type: String,
        default: 'Inter',
    },
    baseFontSize: {
        type: Number,
        default: 16,
    },
    customLayout: {
        type: Object,
        default: {} // Will store x,y coordinates and styles for draggable elements
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('VisitingCard', visitingCardSchema);
