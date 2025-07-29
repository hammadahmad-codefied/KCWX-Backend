const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../Model/UserModel.js");
const mongoose = require("mongoose");
const Connect = require("../../database/connection.js");

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    await Connect();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        role: user.role,
      },
      process.env.JWT_KEY
    );

    console.log("Login successful:", user.email);

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};
const SignUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    await Connect();
    const Olduser = await User.findOne({ email });

    if (Olduser) {
      res.status(203).json({ message: "User Already Exist", status: 203 });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          res.status(500).json({
            message: "Error",
            error: err,
          });
        } else {
          const New_User = new User({
            ...req.body,
            email,
            password: hash,
            reset_Token: jwt.sign(
              {
                email,
                password,
              },
              process.env.JWT_KEY
            ),
            expiry_date: Date.now() + 86400,
          });

          New_User.save().then((result) => {
            res
              .status(201)
              .json({ message: "User created", result: result, status: 201 });
          });
        }
      });
    }
  } catch (error) {
    res.send(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    await Connect();
    User.findOneAndDelete({ _id: req.params.id }, (err, user) => {
      if (err) {
        res.status(500).json({
          message: "Error",
          error: err,
        });
      } else if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json({
          message: "User deleted",
        });
      }
    });
  } catch (error) {
    res.send(error);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const token = req.headers["ACESS_TOKEN"];
    await Connect();
    User.findOne({ reset_token: token }, (err, user) => {
      if (err) {
        res.status(500).json({
          message: "Error",
          error: err,
        });
      } else if (!user) {
        res.status(401).json({
          message: "Invalid Token",
        });
      } else if (user) {
        if (user.expiry_token < Date.now()) {
          res.status(401).json({
            message: "Token Expired",
          });
        } else {
          User.password = req.body.password;
          User.save().then(() => {
            res.status(201).json({ message: "Password changed" });
          });
        }
      }
    });
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  Login,
  SignUp,
  deleteUser,
  forgetPassword,
};
