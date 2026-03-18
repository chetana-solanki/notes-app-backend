const mongoose = require("mongoose");
const mongooseURL = process.env.MONGO_URL;

const connectToMongo = () => {
    try {
        mongoose.connect(mongooseURL)
        console.log("connected to mongo sucessfully");
    } catch (error) {
        console.error("mongo connection failed", error.message);
    }
}

module.exports = connectToMongo;