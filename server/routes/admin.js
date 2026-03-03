const express = require('express');
const router = express.Router();
const User = require('../models/User');
const VisitingCard = require('../models/VisitingCard');
const Analytics = require('../models/Analytics');
const { protect, admin } = require('../middleware/auth');

router.get('/analytics', protect, admin, async (req, res) => {
    try {
        const totalViews = await Analytics.countDocuments({ eventType: 'view' });
        const totalShares = await Analytics.countDocuments({ eventType: { $in: ['share', 'share_whatsapp', 'share_email'] } });
        const totalDownloads = await Analytics.countDocuments({ eventType: { $in: ['download_vcf', 'download_pdf', 'download_png'] } });

        // Month by Month growth (using createdAt aggregation)
        const monthlyGrowth = await Analytics.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    views: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ totalViews, totalShares, totalDownloads, monthlyGrowth });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/cards', protect, admin, async (req, res) => {
    try {
        const cards = await VisitingCard.find({}).populate('userId', 'name email');
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/user/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // remove all user cards
        await VisitingCard.deleteMany({ userId: user._id });
        await user.deleteOne();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/card/:id', protect, admin, async (req, res) => {
    try {
        const card = await VisitingCard.findById(req.params.id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        await card.deleteOne();
        res.json({ message: 'Card deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
