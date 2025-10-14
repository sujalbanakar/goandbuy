import mongoose from "mongoose";

const userSchema=mongoose.Schema({
fullname:String,
email:String,
password:String,
cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      }
    }
  ],
buy: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      }
    }
  ],
orders: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    quantity: Number,
    date: {
      type: Date,
      default: Date.now
    },
  }
],
address: {
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pinCode: { type: String, default: '' },
  country: { type: String, default: '' }
},
googleId: {
  type: String
},
contact:Number,
picture :Buffer,
},{ timestamps: true })

export default mongoose.model("user", userSchema); 