const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(
  "mongodb+srv://mediconnect:mediconnect123@cluster0.nrfw856.mongodb.net/mediconnect?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("MediConnect API Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});