const mongoose = require("mongoose");

const StreamingLocationSchema = mongoose.Schema(
    {
        lat: { type: String, required: true },
        lng: { type: String, required: true },
        county: { type: String, required: true },
        isAllowed: { type: Boolean, required: true },
    },
    { timestamps: true }
);

const StreamingLocation = mongoose.model("StreamingLocation", StreamingLocationSchema);
module.exports = StreamingLocation;
