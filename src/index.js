
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const route = require("./routes/route")
const multer = require("multer")
const app = express();

app.use(bodyParser.json());

app.use(multer().any())
app.use('/', route)

const url = "mongodb+srv://Saif2:Pvvluxhd2m5OOHIg@cluster0.j5omh.mongodb.net/group35DataBase"
mongoose.connect(url,{useNewUrlParser:true})
.then(()=> console.log("Mongodb is connected"))
.catch(err => console.log(err))

app.listen(3000, function(){
    console.log("express app is running on PORT 3000")
})