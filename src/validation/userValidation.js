const { body } = require("express-validator");

const postUserValidationRules = [
  body("username").notEmpty().withMessage("Username is required."),
  body("email")
    .isEmail()
    .withMessage("Invalid email format.")
    .notEmpty()
    .withMessage("Email is required."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
  body("repeatPassword")
    .notEmpty()
    .withMessage("Repeat password is required.")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

module.exports = {
  postUserValidationRules,
};
