const express = require("express");

const app = express();

app.use("/api/posts", (req, res, next) => {
  const posts = [
    {
      id: "dfjdkfsl123",
      title: "First server side post",
      content: "Post from the server",
    },
    {
      id: "ekfretg8egn",
      title: "Second server side post",
      content: "Second post from the server",
    },
  ];
  res.status(200).json({
    message: "Posts fetched successfully",
    posts: posts,
  });
});

module.exports = app;
