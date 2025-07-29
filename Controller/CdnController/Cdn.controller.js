const Cdn = require("../../Model/CdnModel");
const Connect = require("../../database/connection");



// Create a new CDN
const addCdn = async (req, res) => {
    try {
        await Connect();
        const cdn = new Cdn(req.body);
        await cdn.save();
        res.status(201).json(cdn);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all CDNs
const getAllCdns = async (req, res) => {
    try {
        await Connect();
        const cdns = await Cdn.find();
        res.json(cdns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a specific CDN
const getCdn = async (req, res) => {
    try {
        await Connect();
        const cdn = await Cdn.findById(req.params.id);
        if (!cdn) {
            return res.status(404).json({ error: 'CDN not found' });
        }
        res.json(cdn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update a CDN
const updateCdn = async (req, res) => {
    try {
        await Connect();
        const cdn = await Cdn.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!cdn) {
            return res.status(404).json({ error: 'CDN not found' });
        }
        res.json(cdn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Remove a CDN
const removeCdn = async (req, res) => {
    try {
        await Connect();
        const cdn = await Cdn.findByIdAndDelete(req.params.id);
        if (!cdn) {
            return res.status(404).json({ error: 'CDN not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    addCdn,
    getAllCdns,
    getCdn,
    updateCdn,
    removeCdn,
};
