const User = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.json(err);
  }
};

module.exports = {
  getUsers,
};
