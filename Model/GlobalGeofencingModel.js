const mongoose = require("mongoose");

const GlobalGeofencingSchema = mongoose.Schema(
    {
        isGeofenceEnabled: { type: Boolean },
        isGeofenceEnabledTest: { type: Boolean },
        isProgramEnabled: { type: Boolean },
        isProgramEnabledTest: { type: Boolean },
        isAutomationEnabled: { type: Boolean },
        fromAutomation: { type: Boolean },
        message: { type: String },
    },
    { timestamps: true }
);

//create one for isProgramEnabled

// const isProgramEnabledSchema = mongoose.Schema(
//     {
        
//     },
//     { timestamps: true }
// );

const GlobalGeofencing = mongoose.model("GlobalGeofencing", GlobalGeofencingSchema,);
module.exports = GlobalGeofencing;
