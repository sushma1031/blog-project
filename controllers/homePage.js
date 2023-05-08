const Post = require("../database/Post.js");
const date = require("../date.js");

module.exports = (req, res) => {
  Post.find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .then((posts) => {
      posts.forEach((post) => {
        post.relativeDate = date.calcDate(post.createdAt);
      });
      res.render("home", {
        posts: posts,
      });
    })
    .catch((err) => console.log(err));
};
