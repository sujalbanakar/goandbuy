import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  name: String,
  price: Number,
  discount: {
    type: Number,
    default: 0
  },
inStock: {
  type: Number,
  default: 0
},
  isNew: Boolean,
  popularity: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  image: Buffer,
  bgcolor: String,
  panelcolor: String,
  textcolor: String,
  brand: String,
  warranty: String,
  offers: [String],
  features:[String],
  specifications:[String],
  //  {
    // type: Map,
    // of: String
  // },
  // deliveryOptions: [String],  // like ['Free Delivery', 'Secure Transaction']
}, { timestamps: true });

const productModel = mongoose.model('Product', productSchema);
export default productModel;
