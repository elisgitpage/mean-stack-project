const express = require("express");

const app = express();

app.use((req, res, next) => {
  console.log("First use statement");
  next();
});

app.use((req, res, next) => {
  res.send("This is the response from express!");
});

module.exports = app;
