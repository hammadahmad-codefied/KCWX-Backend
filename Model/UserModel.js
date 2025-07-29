const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String },
    reset_Token: { type: String },
    expiry_date: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
