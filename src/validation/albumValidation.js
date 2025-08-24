const { body } = require("express-validator");

const albumCreateValidationRules = [
  body("title")
    .notEmpty()
    .withMessage("Album title is required.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters."),

  body("artist")
    .notEmpty()
    .withMessage("Artist name is required.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Artist name must be between 1 and 100 characters."),

  body("coverImage")
    .optional()
    .custom((value, { req }) => {
      if (req.file && req.file.mimetype.startsWith("image/")) {
        return true;
      } else if (!req.file) {
        return true;
      }
      return false;
    })
    .withMessage("Please upload a valid image file"),
];

const albumAddSongValidationRules = [
  body("albumId").notEmpty().withMessage("Album ID is required."),
  body("songId").notEmpty().withMessage("Song ID is required."),
];

module.exports = {
  albumCreateValidationRules,
  albumAddSongValidationRules,
};
