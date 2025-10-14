import mongoose from "mongoose";
import config from 'config'
import debug from 'debug';
const mongooseDebug = debug('development:mongoose');  //To not show console stuff to other developer
//we can write here whatever we want like  debug('chaha:sujal');

mongoose
.connect(`${config.get("MONGODB_URI")}/Go_&_Buy`)
.then(function(){
  mongooseDebug('connected');   
  //$env:DEBUG = "development:*" (type this in terminal to run this and and then Enter and then type npx nodemon app.js)
})
.catch(function(err){
    mongooseDebug(err);
})

export default mongoose.connection; 