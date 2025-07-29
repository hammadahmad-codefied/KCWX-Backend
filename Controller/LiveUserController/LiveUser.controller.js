const LiveUser = require("../../Model/LiveUserModel.js");
const Connect = require("../../database/connection.js");



// Create a new LiveUser
const addLiveUser = async (req, res) => {
    try {
        await Connect();
        const liveUser = new LiveUser(req.body);
        await liveUser.save();
        res.status(201).json(liveUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all LiveUsers
const getAllLiveUsers = async (req, res) => {
    try {
        await Connect();
        const liveUser = await LiveUser.find();
        res.json(liveUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a specific LiveUser
const getLiveUser = async (req, res) => {
    try {
        await Connect();
        const liveUser = await LiveUser.findById(req.params.id);
        if (!liveUser) {
            return res.status(404).json({ error: 'Live user not found' });
        }
        res.json(liveUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update a LiveUser
const updateLiveUser = async (req, res) => {
    try {
        await Connect();
        const liveUser = await LiveUser.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!liveUser) {
            return res.status(404).json({ error: 'Live user not found' });
        }
        res.json(liveUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Remove a LiveUser
const removeLiveUser = async (req, res) => {
    try {
        await Connect();
        const liveUser = await LiveUser.findByIdAndDelete(req.params.id);
        if (!liveUser) {
            return res.status(404).json({ error: 'Live user not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    addLiveUser,
    getAllLiveUsers,
    getLiveUser,
    updateLiveUser,
    removeLiveUser,
};
