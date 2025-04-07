const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const { postUserValidationRules } = require("../validation/userValidation");

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.json(err);
  }
};

const postUser = [
  ...postUserValidationRules,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;

    try {
      const existingUsername = await User.findOne({ username });
      const existingEmail = await User.findOne({ email });

      if (existingUsername) {
        return res.status(409).json({ message: "Username is already in use" });
      }
      if (existingEmail) {
        return res.status(409).json({ message: "Email is already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      return res.status(201).json({
        message: "User created successfully.",
        user: {
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (err) {
      console.error("Error creating user:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
];

module.exports = {
  getUsers,
  postUser,
};
