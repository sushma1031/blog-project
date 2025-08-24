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
        return res.status(404).render("errors/404", {
          title: "Not Found",
          message: "We couldn’t find the post you’re looking for.",
          redirect: "/posts",
          redirectText: "All Posts"
        });
      }
    })
    .catch((error) => {
      console.error("Unexpected error while fetching post", error);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "An unexpected error occurred.",
      });
    });
};
