const mongoose = require('mongoose');
const VisitingCard = require('../models/VisitingCard');
const Analytics = require('../models/Analytics');

exports.createCard = async (req, res) => {
    try {
        let baseSlug = (req.body.name || 'card').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

        const cardData = { ...req.body, userId: req.user._id, slug: req.body.slug || uniqueSlug };
        const card = await VisitingCard.create(cardData);
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyCards = async (req, res) => {
    try {
        const cards = await VisitingCard.find({ userId: req.user._id });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCardById = async (req, res) => {
    try {
        const card = await VisitingCard.findById(req.params.id);
        if (card) {
            if (card.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
            res.json(card);
        } else {
            res.status(404).json({ message: 'Card not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCard = async (req, res) => {
    try {
        const card = await VisitingCard.findById(req.params.id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        if (card.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedCard = await VisitingCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const card = await VisitingCard.findById(req.params.id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        if (card.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await card.deleteOne();
        res.json({ message: 'Card removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicCard = async (req, res) => {
    try {
        const { slug } = req.params;
        const query = mongoose.isValidObjectId(slug) ? { _id: slug } : { slug };
        const card = await VisitingCard.findOne(query);

        if (!card) return res.status(404).json({ message: 'Card not found' });
        if (!card.isPublic) return res.status(403).json({ message: 'Profile is private' });

        res.json(card);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.trackAnalytics = async (req, res) => {
    try {
        const { id } = req.params; // card _id
        const { eventType, device } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;

        await Analytics.create({
            cardId: id,
            eventType,
            ipAddress,
            device: device || 'Desktop'
        });

        res.json({ success: true });
    } catch (error) {
        // Failing silently is often preferred for analytics so it doesn't break UI
        res.status(500).json({ message: error.message });
    }
};
