const User = require("../models/userModel");
const { postUserValidationRules } = require("../validation/userValidation");
const { validateRequest } = require("../middleware/validationMiddleware");
const {
  isUserExists,
  createUser,
  loginAuth,
} = require("../services/userService");

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
  validateRequest,

  async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const userExistError = await isUserExists(res, username, email);

      if (userExistError) {
        return userExistError;
      }

      const newUser = await createUser(username, email, password);

      return res.status(201).json({
        message: "register.userSuccess",
        user: {
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (err) {
      console.error("Error creating user:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
];

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { success, message } = await loginAuth(username, password);

    if (!success) {
      return res.status(401).json({ message });
    }

    return res.status(200).json({ message: "Loged in!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUsers,
  postUser,
  loginUser,
};
