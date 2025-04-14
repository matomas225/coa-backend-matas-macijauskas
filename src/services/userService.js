const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const isUserExists = async (res, username, email) => {
  const existingUsername = await User.findOne({ username });
  const existingEmail = await User.findOne({ email });

  if (existingUsername) {
    return res.status(409).json({ message: "register.errors.usernameInUse" });
  }
  if (existingEmail) {
    return res.status(409).json({ message: "register.errors.emailInUse" });
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

const loginAuth = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    return {
      success: false,
      message: "Username or password is incorrect.",
    };
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return {
      success: false,
      message: "Username or password is incorrect.",
    };
  }

  return { success: true, user: user };
};

module.exports = { isUserExists, createUser, loginAuth };
