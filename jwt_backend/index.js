const express = require("express");
const cookieParser = require("cookie-parser");

const authRouter = require("./src/auth");
// const { getTokens } = require("./src/auth/utils");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);

// console.log(getTokens("admin"));

const port = 3001;
app.listen(port, () => console.log(`Server listens port: ${port}`));