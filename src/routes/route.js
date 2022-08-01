const express= require("express")
const router = express.Router();
const userController = require("../controllers/userController")
const {authenticate} = require('../middleware/auth')
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")

//===================== USER=========================================//

router.post("/register", userController.createUser)
router.post("/login", userController.userLogin)
router.get("/user/:userId/profile" ,authenticate, userController.getUserProfile)
router.put("/user/:userId/profile" , authenticate , userController.updateUserProfile)

//=========================== PRODUCT=============================================//

router.post("/products",productController.createProduct)
router.get("/products",productController.filterProduct)
router.get("/products/:productId",productController.getProductById)
router.put("/products/:productId" , productController.updateProduct)
router.delete("/products/:productId" , productController.deleteProduct)

//=========================== CART=============================================//


router.post("/users/:userId/cart" ,authenticate , cartController.createCart)
router.put("/users/:userId/cart" , authenticate , cartController.updateCart)
router.get("/users/:userId/cart" , authenticate , cartController.getCartDetails)
router.delete("/users/:userId/cart" , authenticate , cartController.deletCart)

router.all("/**" , (req , res)=>{
    res.status(400).send({message: "please enter correct endpoint"})
})

module.exports = router
