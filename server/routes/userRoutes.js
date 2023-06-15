// This file handle all the calls which are coming to backend and then sending it to respective functions in userController
const { register, login } = require("../controllers/userController");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;