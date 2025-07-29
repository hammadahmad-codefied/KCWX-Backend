const mongoose = require("mongoose");

const LiveUsersSchema = mongoose.Schema(
    {
        ip: { type: String, required: true },
        isOnline: { type: Boolean },
        onlineDate: { type: String }
    },
    { timestamps: true }
);

const LiveUser = mongoose.model("LiveUser", LiveUsersSchema);
module.exports = LiveUser;
