import mongoose from "mongoose";

mongoose
.connect('mongodb://127.0.0.1:27017/scatch')
.then(function(){
  console.log('connected');
})
.catch(function(err){
    console.log(err.message);
})

export default mongoose.connection; 