const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/getUsers", userController.getUsers);

router.post("/postUser", userController.postUser);

router.post("/loginUser", userController.loginUser);

module.exports = router;
