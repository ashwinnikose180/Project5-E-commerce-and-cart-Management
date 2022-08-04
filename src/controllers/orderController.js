const mongoose = require("mongoose");
const orderModel = require("../models/orderModel")
const userModel = require("../models/userModel")
const cartModel = require("../models/cartModel")


const createOrder = async  function(req ,res){
    try{
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

        let cartId = req.body.cartId
        if(!cartId){
            return res.status(400).send({status:false, message:"please enter cartId in body"})
        }
        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Invalid cartrid" })
        }
let cart = await cartModel.findOne({_id:cartId, userId:userId})
        if(!cart){
            return res.status(404).send({status:false, message:"cart is not exist with this cartId and userId"})
        }
        if(cart.items.length==0){
            return res.status(400).send({status:false, message: " cart is empty ,please add some items to this cart before ordering "})
        }
let totalQuantity =0;
        for(let i of cart.items){
totalQuantity += i.quantity
        }
        let orderData ={
            userId:userId,
            items: cart.items,
            totalPrice : cart.totalPrice,
            totalItems :cart.totalItems,
            totalQuantity:totalQuantity,
            
        }

        let order = await orderModel.create(orderData)

        cart.items = []
        cart.totalItems = 0
        cart.totalPrice = 0
        await cart.save()


        let orderObj = {
            userId :order.userId,
            items: order.items,
            totalPrice:order.totalPrice,
            totalItems: order.totalItems,
            totalQuantity :order.totalQuantity,
            cancellable:order.cancellable,
            status:order.status,
            createdAt:order.createdAt,
            updatedAt:order.updatedAt
        }
       

        return res.status(201).send({status:false, message :"order susscessfully created", data:orderObj})


    }catch(err){
        return res.status(500).send({status:false, message: err.message})
    }


}


// ========================================  UPDATE ORDER ================================================//

const updateOrder = async function(req,res){
    try{
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


        // req body

        let {orderId, status} = req.body
        if(!orderId){
            return res.status(400).send({status:false, message:"please enter orderid to update"})
        }

        if(!status){
            return res.status(400).send({status:false, message:"please enter status to update"})
        }
        let arr= ["pending", "completed", "cancelled"]
        if(!arr.includes(status)){
            return res.status(400).send({status:false, message:`please enter status one of these ["pending", "completed", "cancelled"]`})
        }
        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "Invalid orderId" })
        }
        let order = await orderModel.findOne({_id :orderId, userId:userId})
        if(!order){
            return res.status(404).send({status:false, message:"no order found with this orderId and userId"})
        }
        if(order.status=="cancelled"){
            return res.status(400).send({status:false, message:" order has been already cancelled you can't update this order"})
        }

        if(order.cancellable != true && status == "cancelled"){
            return res.status(400).send({status:false, message:"only cancellable order can be cancelled"})
        }
       
        order.status = status;
        await order.save()

        return res.status(200).send({status:true, message:" order updated successfully", data:order})
        
        
        



    }catch(err){
        return res.status(500).send({status:false, message: err.message})
    }

}

module.exports = {createOrder, updateOrder}