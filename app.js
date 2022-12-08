const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

require("dotenv/config"); // including env file.

app.use(cors());
app.options("*", cors()); // Allowing every request to be pass from any other origin.
app.use(authJwt());
app.use(errorHandler);
app.use(morgan("tiny")); // using morgan for logging each and every request(get, post)
app.use(express.json()); //Middleware

//Routes
const productRouter = require("./routers/products");
app.use(`${process.env.API_URL}/products`, productRouter);


const userRouter = require("./routers/users");
app.use(`${process.env.API_URL}/users`, userRouter);

const categoryRouter = require("./routers/categories");
app.use(`${process.env.API_URL}/category`, categoryRouter);


const orderRouter = require("./routers/orders");
app.use(`${process.env.API_URL}/order`, orderRouter);

app.use(`/${process.env.UPLOAD_DIR}/`, express.static(`${__dirname}/${process.env.UPLOAD_DIR}/`));

// database connection string.
mongoose.connect(process.env.CONNECTION_STRING, {
  dbName: process.env.DB_NAME, // getting value from .env file.
}).then(() => {
  console.log("connected.");
}).catch((error) => {
  console.log("connection failed... " + error);
});

// checking server is running or not.
app.listen(process.env.PORT, () => {
  console.log(process.env.API_URL);
  console.log("Server is running on http://localhost:3000");
});
