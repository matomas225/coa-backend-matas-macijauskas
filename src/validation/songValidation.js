const { body } = require("express-validator");

const songUploadValidationRules = [
  body("title")
    .notEmpty()
    .withMessage("Song title is required.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters."),
  
  body("artist")
    .notEmpty()
    .withMessage("Artist name is required.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Artist name must be between 1 and 100 characters."),
  
  body("album")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Album name must not exceed 100 characters."),
];

module.exports = {
  songUploadValidationRules,
}; 