const Post = require("../database/Post.js");
const date = require("../date.js");

module.exports = (req, res) => {
  Post.find({})
    .then((posts) => {
      posts.forEach((post) => {
        post.dateString = date.getDate(post.createdAt);
      });
      res.render("posts", { posts });
    })
    .catch((err) => console.log(err));
};