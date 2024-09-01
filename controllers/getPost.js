const Post = require("../database/Post.js");
const User = require("../database/User.js");
const mongoose = require("mongoose");
const date = require("../date.js");

module.exports = (req, res) => {
  Post.findOne({ _id: req.params.postID })
    .then((post) => {
      if (post) {
        const day = date.getDate(post.createdAt);
        let postCreator = "Anonymous";
        User.findOne({ _id: post.creator})
          .then((user) => {
            if (user) postCreator = user.username;
            return res.render("post", {
              title: post.title,
              content: post.content,
              username: postCreator,
              datePosted: day,
              image: post.image.url,
              imageSource: post.image.source,
            });
          })
          .catch((e) => console.log(e.message));
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
