const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require('path');
const dotenv = require("dotenv");
const pinRoute = require("./routes/pins");
const userRoute = require("./routes/users")

dotenv.config();

app.use(express.json())



mongoose
.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true, })
    .then(() => console.log("MongoDB Connected"))
    .catch((err)=> console.log(err));

app.use("/api/pins", pinRoute);
app.use("/api/users", userRoute);


// For Heorku Deployment
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "/client/build")))
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, "client", "build", "index.html")))
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Backend server is running ${PORT} on ${process.env.NODE_ENV}`);
});