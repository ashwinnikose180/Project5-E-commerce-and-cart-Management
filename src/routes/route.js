const express= require("express")
const router = express.Router();
const userController = require("../controllers/userController")
const {authenticate} = require('../middleware/auth')
const productController = require("../controllers/productController")

//===================== USER=========================================//

router.post("/register", userController.createUser)
router.post("/login", userController.userLogin)
router.get("/user/:userId/profile" ,authenticate, userController.getUserProfile)
router.put("/user/:userId/profile" , authenticate , userController.updateUserProfile)

//=========================== PRODUCT=============================================//

router.post("/products",productController.createProduct)
router.get("/products",productController.filterProduct)
router.get("/products/:productId",productController.getProductById)

module.exports = router
