const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const userModel = require('../models/userModel')

const authenticate = async function(req , res , next){
    try{
        let bearertoken = req.headers.authorization
        if(!bearertoken){
            return res.status(400).send({status: false , message: "please enter token"})
        }
        bearertoken = bearertoken.split(" ")
        let token = bearertoken[1]
        jwt.verify(token , "GROUP-35" , (err , decodedtoken)=>{
            if(err){
                return res.status(401).send({status: false , message: err.message})
            }
            req.decodedtoken = decodedtoken
            next()
        })
    }
    catch(err){
        res.status(500).send({status:false , message: err.message})
    }
}

module.exports = {authenticate}
