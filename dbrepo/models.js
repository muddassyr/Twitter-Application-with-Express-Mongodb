

var mongoose = require('mongoose')

let dbURI = "mongodb+srv://legend:legend123@cluster0.2c3x6.mongodb.net/testdb?retryWrites=true&w=majority";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('connected', function(){
    console.log("mongoose is connected")
})

mongoose.connection.on('disconnected', function(){
    console.log("mongoose is disconnected");
    process.exit(1)

})

mongoose.connection.on('error', function(err){
    console.log("mongoose connection error: " , err);
    process.env(1)
})

process.on("SIGINT", function(){
    console.log('app is terminating');
    mongoose.connection.close(function(){
        console.log("Mongoose default connection closed")
        process.env(0)
    })
})


var userSchema = new mongoose.Schema({
    "name": String,
    "email": String,
    "password": String,
    "createdOn": { "type": Date,  "default": Date.now},
    "activeSince": Date
});

var userModel = mongoose.model("users", userSchema);

var optSchema = new mongoose.Schema({
    "email": String,
    "optCode": String,
    "createdOn": { "type": Date, "default": Date.now}
})

var optModel = mongoose.model("opta" , optSchema);

module.exports = {
    userModel: userModel,
    optModel : optModel
}