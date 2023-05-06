const Post = require("../database/Post.js");

module.exports = (req, res) => {
  Post.findByIdAndDelete({ _id: req.params.postID })
    .then(() => {
      res.redirect("/posts");
    })
    .catch((error) => {
      console.log(error.message);
    });
};