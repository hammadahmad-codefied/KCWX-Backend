const express = require("express");

const {
  AddUser,
  GetAllUsers,
  UpdateUser,
  DeleteUser,
  FindUserById,
  ChangePassword,
} = require("../../Controller/UserController/User.controller.js");

const router = express.Router();

router.post("/create", AddUser);
router.get("/", GetAllUsers);
router.put("/:id", UpdateUser);
router.delete("/:id", DeleteUser);
router.get("/:id", FindUserById);

router.put("/password/:id", ChangePassword);

module.exports = router;
