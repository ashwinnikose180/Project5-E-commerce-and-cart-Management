const cartModel = require('../models/cartModel')
const mongoose = require('mongoose')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (userId == ":userId") {
            return res.status(400).send({ status: false, message: "please enter userId in params" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userid" })
        }
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) {
            return res.status(404).send({ status: false, message: "user not exist or deleted" })
        }
        let decodedToken = req.decodedtoken
        if (decodedToken.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized to access others cart" })
        }
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "please enter the details in request body" })
        }
        let { cartId, productId } = req.body

        if (!productId) {
            return res.status(400).send({ status: false, message: "enter productid in body" })
        }

        // if(!mongoose.isValidObjectId(cartId)){
        //     return res.status(400).send({status: false , message: "Invalid cartId"})
        // }
        

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productid" })
        }

        let product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            return res.status(404).send({ status: false, message: "product does not exist or deleted with this id" })
        }

        let cart = await cartModel.findOne({ userId: userId})
        if (cart) {
            

            let found = false
            for (let obj of cart.items) {
                if (obj.productId == productId) {
                    obj.quantity += 1
                    found = true
                }
            }

            if (!found) {
                cart.items.push({ productId: productId })
            }
            cart.totalPrice += product.price
            cart.totalItems = cart.items.length
            await cart.save()
            await cart.populate([{path: "items.productId"}])
            return res.status(201).send({ status: true, message: "items added to cart successfully", data: cart })
        }
        else {
            // console.log(product.price)
            let data = { userId: userId, items: [{ productId: productId, quantity: 1 }], totalPrice: product.price, totalItems: 1 }

            let ncart = await cartModel.create(data)
            await ncart.populate([{path: "items.productId"}])
            return res.status(201).send({ status: true, message: "cart created and items added to cart successfully", data: ncart })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (userId == ":userId") {
            return res.status(400).send({ status: false, message: "please enter userId in params" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userid" })
        }

        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) {
            return res.status(404).send({ status: false, message: "user not exist or deleted" })
        }

        let decodedToken = req.decodedtoken
        if (decodedToken.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized to access others cart" })
        }
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "please enter the details in request body" })
        }

        let { cartId, productId, removeProduct } = req.body

        if (!cartId) {
            return res.status(400).send({ status: false, message: "enter cartId in body" })
        }
        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Invalid cartid" })
        }
        if (!productId) {
            return res.status(400).send({ status: false, message: "enter productId in body" })
        }
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productid" })
        }
        // console.log(removeProduct)
        if (removeProduct == undefined) {
            return res.status(400).send({ status: false, message: "enter removeProduct in body" })
        }
        if (typeof removeProduct != "number" || !(removeProduct == 0 || removeProduct == 1)) {
            return res.status(400).send({ status: false, message: "removeproduct should be in number and value either 0 or 1" })
        }

        let cart = await cartModel.findOne({ _id: cartId})
        if (!cart) {
            return res.status(404).send({ status: false, message: "cart not found with this cart id" })
        }

        if (cart.userId != userId) {
            return res.status(401).send({ status: false, message: "can not access different cart" })
        }

        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(404).send({ status: false, message: "No product found with this productid" })
        }
        if (removeProduct == 0) {
            let pfound = false
            for (let indx = 0; indx < cart.items.length; indx++) {
                if (cart.items[indx].productId == productId) {
                    cart.totalPrice -= (product.price * cart.items[indx].quantity)
                    cart.items.splice(indx, 1)
                    cart.totalItems -= 1
                    pfound = true
                }
            }
            if (!pfound) {
                return res.status(400).send({ status: false, message: "Product not found in the cart" })
            }
            await cart.save()
            await cart.populate([{path: "items.productId"}])
            return res.status(200).send({ status: true, message: "cart updated successfully", data: cart })
        }
        else {
            let pfound = false
            for (let indx = 0; indx < cart.items.length; indx++) {
                if (cart.items[indx].productId == productId) {
                    cart.items[indx].quantity -= 1
                    if (cart.items[indx].quantity < 1) {
                        cart.items.splice(indx, 1)
                        cart.totalPrice -= product.price
                        cart.totalItems -= 1
                    }
                    else {
                        cart.totalPrice -= product.price
                    }
                    pfound = true
                }
            }
            if (!pfound) {
                return res.status(400).send({ status: false, message: "Product not found in the cart" })
            }
            await cart.save()
            await cart.populate([{path: "items.productId"}])
            return res.status(200).send({ status: true, message: "cart updated successfully", data: cart })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//==================================================Get cart Details==============================================//

const getCartDetails = async function (req, res) {
    try {
        let userId =req.params.userId
        if(userId ==":userId"){
            return res.status(400).send({ status: false, message: "please enter userId in params" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userid" })
        }
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) {
            return res.status(404).send({ status: false, message: "user not exist or deleted" })
        }
        let decodedToken = req.decodedtoken
        if (decodedToken.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized to access others cart" })
        }
        let cart = await (await cartModel.findOne({userId: userId})).populate([{path: "items.productId"}])
        if(!cart){
            return res.status(404).send({status: false , message: "no cart found with this user id or cart was deleted"})
        }
        return res.status(200).send({status: true , message: "cart summary" , data: cart})

    }
     catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

const deletCart = async function(req , res){
    try{
        let userId =req.params.userId
        if(userId ==":userId"){
            return res.status(400).send({ status: false, message: "please enter userId in params" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userid" })
        }
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) {
            return res.status(404).send({ status: false, message: "user not exist or deleted" })
        }
        let decodedToken = req.decodedtoken
        if (decodedToken.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized to access others cart" })
        }
        let cart = await cartModel.findOne({userId: userId})
        if(!cart){
            return res.status(404).send({status: false , message: "no cart found with this user id or cart was deleted"})
        }
        cart.items = []
        cart.totalItems = 0
        cart.totalPrice = 0
        await cart.save()
        return res.status(204).send({status: true , message: "cart items deleted successfully"})
    }
    catch(err){
        res.status(500).send({status: false , message: err.message})
    }
}

module.exports = { createCart, updateCart , getCartDetails , deletCart }