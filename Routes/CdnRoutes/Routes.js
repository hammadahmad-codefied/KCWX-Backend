const express = require("express");

const {
    addCdn,
    getAllCdns,
    getCdn,
    updateCdn,
    removeCdn
} = require("../../Controller/CdnController/Cdn.controller.js");

const router = express.Router();

router.post("/", addCdn);
router.get("/", getAllCdns);
router.get("/:id", getCdn);
router.put("/:id", updateCdn);
router.delete("/:id", removeCdn);

module.exports = router;
