require("dotenv").config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

connectToMongo()
const app = express();
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())

// // ✅ Basic Home Route
// app.get("/", (req, res) => {
//   res.send("Backend is running 🚀");
// });

app.use("/api/auth", require("./routes/auth"))
app.use("/api/notes", require("./routes/note"))

app.listen(port,()=>{
    console.log(`backend is listening at http://localhost:${port}`)
})
