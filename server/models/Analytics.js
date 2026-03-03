const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VisitingCard',
        required: true
    },
    eventType: {
        type: String,
        enum: ['view', 'qr_scan', 'download_vcf', 'download_png', 'download_pdf', 'share_whatsapp', 'share_email', 'call', 'email', 'website_click'],
        required: true
    },
    ipAddress: String,
    country: { type: String, default: 'Unknown' },
    device: { type: String, default: 'Desktop' }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
