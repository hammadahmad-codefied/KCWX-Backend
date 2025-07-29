const express = require("express");

const {
    addLiveUser,
    getAllLiveUsers,
    getLiveUser,
    updateLiveUser,
    removeLiveUser,
} = require("../../Controller/LiveUserController/LiveUser.controller.js");

const router = express.Router();

router.post("/", addLiveUser);
router.get("/", getAllLiveUsers);
router.get("/:id", getLiveUser);
router.put("/:id", updateLiveUser);
router.delete("/:id", removeLiveUser);

module.exports = router;
