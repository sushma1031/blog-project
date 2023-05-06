const Post = require("../database/Post.js");
const date = require("../date.js");

module.exports = (req, res) => {
  Post.findOne({ _id: req.params.postID })
    .then((post) => {
      if (post) {
        const day = date.getDate(post.createdAt);
        res.render("post", {
          title: post.title,
          content: post.content,
          username: post.username,
          datePosted: day,
          image: post.image.url,
          imageSource: post.image.source,
        });
      }
    })
    .catch((error) => {
      const arguments = {
        statusCode: "404",
        message: "We couldn’t find that page you’re looking for.",
        redirect: "/",
        button: "Go Home",
      };
      res.status(404).render("error", arguments);
    });
};
