const Post = require("../database/Post.js");
const date = require("../utils/date.js");

module.exports = (req, res) => {
  Post.findOne({ _id: req.params.postID })
    .populate('creator', 'username')
    .then((post) => {
      if (post) {
        return res.render("post", {
          title: post.title,
          content: post.content,
          username: post.creator?.username || "Anonymous",
          datePosted: date.getDate(post.createdAt),
          image: post.image.url,
          imageSource: post.image.source,
        });
      } else {
        const arguments = {
          statusCode: "404",
          message: "We couldn’t find the post you’re looking for.",
          redirect: "/",
          button: "Go Home",
        };
        res.status(404).render("error", arguments);
      }
    })
    .catch((error) => {
      console.log(error.message)
      res.redirect("/");
    });
};
