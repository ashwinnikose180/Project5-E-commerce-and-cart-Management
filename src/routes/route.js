const express= require("express")
const router = express.Router();
const userController = require("../controllers/userController")
const {authenticate} = require('../middleware/auth')




router.post("/register", userController.createUser)
router.post("/login", userController.userLogin)
router.get("/user/:userId/profile" ,authenticate, userController.getUserProfile)
router.put("/user/:userId/profile" , authenticate , userController.updateUserProfile)



module.exports = router
