const mongoose = require("mongoose");
const mongooseURL = "mongodb://localhost:27017/todo";

const connectToMongo = () => {
    try {
        mongoose.connect(mongooseURL)
        console.log("connected to mongo sucessfully");
    } catch (error) {
        console.error("mongo connection failed", error.message);
    }
}

module.exports = connectToMongo;