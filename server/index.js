const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute")

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Handling api call that came from frontend and sending it in userRoutes
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connection Successfull");
    })
    .catch((err) => {
        console.log(err.message);
    });

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server started on port ${process.env.PORT}`);
})