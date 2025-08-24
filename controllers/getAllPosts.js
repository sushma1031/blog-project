const Post = require("../database/Post.js");
const date = require("../utils/date.js");

module.exports = (req, res) => {
  Post.find({}, {creator: 0})
    .sort({ createdAt: -1 })
    .then((posts) => {
      posts.forEach((post) => {
        post.dateString = date.getDate(post.createdAt);
      });
      res.render("posts", { posts });
    })
    .catch((err) => {
      console.error("Unexpected error while fetching posts", err);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to fetch posts.",
      });
    });
};