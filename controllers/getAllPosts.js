const Post = require("../database/Post.js");
const date = require("../utils/date.js");

module.exports = (req, res) => {
  Post.find({})
    .sort({ createdAt: -1 })
    .then((posts) => {
      posts.forEach((post) => {
        post.dateString = date.getDate(post.createdAt);
      });
      res.render("posts", { posts });
    })
    .catch((err) => console.log(err));
};