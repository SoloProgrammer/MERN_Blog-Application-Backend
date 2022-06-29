const mongoose = require('mongoose')

require('dotenv').config()

// console.log(process.env.mongoURI);
const connectToMongo = () =>{
        mongoose.connect(process.env.mongoURI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        }).then(()=>{
            console.log("Connected to mongo Successfully")
        }).catch((error) => console.log(error.message))
}

module.exports = connectToMongo;

