import mongoose from "mongoose";

const ownerSchema=mongoose.Schema({
fullname:String,
email:String,
password:String,
products:{
    type:Array,
    default:[]
},
gstin:String,
picture :String,
})

export default mongoose.model("owner", ownerSchema); 