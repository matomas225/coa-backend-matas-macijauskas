const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const isUserExists = async (res, username, email) => {
  const existingUsername = await User.findOne({ username });
  const existingEmail = await User.findOne({ email });

  if (existingUsername) {
    return res.status(409).json({ message: "Username is already in use" });
  }
  if (existingEmail) {
    return res.status(409).json({ message: "Email is already in use" });
  }
  return null;
};

const createUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
};

module.exports = { isUserExists, createUser };
