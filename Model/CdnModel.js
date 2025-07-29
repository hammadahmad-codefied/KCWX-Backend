const mongoose = require("mongoose");

const CdnSchema = mongoose.Schema(
    {
        cdn: { type: String, required: true }
    },
    { timestamps: true }
);

const Cdn = mongoose.model("Cdn", CdnSchema);
module.exports = Cdn;
