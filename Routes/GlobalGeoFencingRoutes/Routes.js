const express = require("express");

const {
    addGlobal,
    getAllGlobalGeofencing,
    getGlobalGeofencing,
    updateGlobalGeofencing,
    removeGlobalGeofencing,
} = require("../../Controller/GlobalGeofencingController/GlobalGeofencing.controller.js");

const router = express.Router();

router.post("/add", addGlobal);
router.get("/", getAllGlobalGeofencing);
router.get("/:id", getGlobalGeofencing);
router.put("/:id", updateGlobalGeofencing);
router.delete("/:id", removeGlobalGeofencing);

module.exports = router;
