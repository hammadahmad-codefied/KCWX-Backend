const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../Model/UserModel.js");
const mongoose = require("mongoose");
const Connect = require("../../database/connection.js");

const AddUser = async (req, res) => {
  try {
    const { fullName, username, email, password, phoneNumber, role } = req.body;
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
            username,
            fullName,
            email,
            phoneNumber,
            password: hash,
            role,
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
              .json({ message: "User created successfully!", result: result, status: 201 });
          });
        }
      });
    }
  } catch (error) {
    res.send(error);
  }
};

const GetAllUsers = async (req, res) => {
  try {
    await Connect();
    let users = await User.find();
    // console.log('users', users);
    res.status(200).json({
      message: "All users fetched",
      users,
    });
  } catch (err) {
    // console.log('GetAllUsers', err)
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const UpdateUser = async (req, res) => {
  try {
    await Connect();
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const updateData = req.body;
    const saltRounds = 10;

    if (updateData.password) {
      bcrypt.hash(updateData.password, saltRounds, async (err, hash) => {
        if (err) {
          return res.status(500).send({ error: err });
        }

        Object.assign(user, updateData);
        user.password = hash;
        await user.save();

        res.send({ message: 'User updated successfully', user });
      });
    } else {
      Object.assign(user, updateData);
      await user.save();

      res.send({ message: 'User updated successfully', user });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}


// @route   PUT api/users/password
// @desc    Change Password
// @access  Private
const ChangePassword = async (req, res) => {
  try {
    const { id: user_id } = req.params;
    const { oldPassword, newPassword } = req.body;
    await Connect();
    // Find user by id
    const user = await User.findById({ _id: user_id }).select("+password");

    // Match password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Old Password" });
    }

    // Create salt & hash
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({
      message: "Password changed successfully",
      password: newPassword,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

const DeleteUser = async (req, res) => {
  try {
    await Connect();
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
      });
    }

    res.status(200).send({ message: "User deleted successflly!", user });
  } catch (error) {
    res.status(500).send(error);
  }
};

const FindUserById = async (req, res) => {
  try {
    await Connect();
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
      });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  AddUser,
  GetAllUsers,
  UpdateUser,
  ChangePassword,
  DeleteUser,
  FindUserById,
};
