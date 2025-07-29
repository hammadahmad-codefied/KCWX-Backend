const express = require("express");

const {
    addStreamingLocation,
    getAllStreamingLocations,
    getStreamingLocation,
    updateStreamingLocation,
    removeStreamingLocation,
    updateStreamingLocationStatus,
    checkStreamingAccess,
    updateStreamAccess,
    checkStreamingAccessInRadius,
    checkInRegion,
    checkStreamingAccessInRadiusLatLng,
    truncateLocations,
    insertAllLocations,
} = require("../../Controller/StreamingLocationController/StreamingLocation.controller.js");

const router = express.Router();

router.post("/", addStreamingLocation);

router.get("/", getAllStreamingLocations);

router.get("/checkInRadius", checkStreamingAccessInRadius);
router.get("/checkInRegion", checkInRegion);

router.get("/:id", getStreamingLocation);
router.get("/check/:lat/:lng", checkStreamingAccess);

// API to check within a radius
router.get("/checkInRadius/:lat?/:lng?", checkStreamingAccessInRadius);
router.get("/checkInRadiusLatLng/:lat?/:lng?/:device?", checkStreamingAccessInRadiusLatLng);
router.get("/checkInRegion", checkInRegion);

router.put("/:id", updateStreamingLocation);

router.patch("/access/:lat/:lng", updateStreamAccess);
router.patch("/location/:id", updateStreamingLocationStatus);


router.delete("/:id", removeStreamingLocation);

// Many events
router.delete("/truncateLocations", truncateLocations);
router.post("/insertAllLocations", insertAllLocations);

module.exports = router;
