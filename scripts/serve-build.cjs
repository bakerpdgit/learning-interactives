const express = require("express");
const path = require("node:path");

const app = express();
app.use(express.static(path.join(__dirname, "..", "build")));
app.listen(4173, "127.0.0.1");
