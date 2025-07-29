const axios = require("axios");
const GlobalGeofencing = require("../../Model/GlobalGeofencingModel.js");
const Connect = require("../../database/connection.js");


// Create a new CDN
const addGlobal = async (req, res) => {
    try {
        await Connect();
        const globalGeofencing = new GlobalGeofencing(req.body);
        await globalGeofencing.save();
        res.status(201).json(globalGeofencing);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all CDNs
const getAllGlobalGeofencing = async (req, res) => {
    try {
        await Connect();
        const globalGeofencings = await GlobalGeofencing.find();
        res.json(globalGeofencings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a specific CDN
const getGlobalGeofencing = async (req, res) => {
    try {
        await Connect();
        const globalGeofencing = await GlobalGeofencing.findById(req.params.id);
        if (!globalGeofencing) {
            return res.status(404).json({ error: 'Global Geofencing not found' });
        }
        res.json(globalGeofencing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const updateGlobalGeofencing = async (req, res) => {
    try {
        await Connect();

        const existingDoc = await GlobalGeofencing.findById(req.params.id);

        if (!existingDoc) {
            return res.status(404).json({ error: 'Global Geofencing not found' });
        }

        // Check if request comes from automation
        if (req.body.fromAutomation === true) {
            // Allow update only if isAutomationEnabled is true
            if (!existingDoc.isAutomationEnabled) {
                return res.status(403).json({ error: 'Automation updates are not enabled' });
            }
        }

        const updatedDoc = await GlobalGeofencing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        // Emit event via HTTP request to Render Socket.IO server
        await axios.post("https://kcwx-socket-server.onrender.com/emit/geofence", {
            id: updatedDoc._id,
            updatedFields: req.body
        });

        res.status(200).json(updatedDoc);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// Remove a CDN
const removeGlobalGeofencing = async (req, res) => {
    try {
        await Connect();
        const globalGeofencing = await GlobalGeofencing.findByIdAndDelete(req.params.id);
        if (!globalGeofencing) {
            return res.status(404).json({ error: 'Global Geofencing not found' });
        }
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    addGlobal,
    getAllGlobalGeofencing,
    getGlobalGeofencing,
    updateGlobalGeofencing,

    removeGlobalGeofencing,
};
