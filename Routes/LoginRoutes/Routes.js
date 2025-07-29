const express = require("express");
// Login and singup and forget pass routes
const {
  Login,
  SignUp,
} = require("../../Controller/LoginController/Login.controller.js");

const router = express.Router();

router.post("/login", Login);
router.post("/signup", SignUp);

module.exports = router;
