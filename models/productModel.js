import mongoose from "mongoose";

const productSchema=mongoose.Schema({
name:String,
price:Number,
discount:{
    type:Number,
    default:0
},
image:String,
bgcolor:String,
panelcolor:String,
textcolor:String,
})

export default mongoose.model("product", productSchema); 