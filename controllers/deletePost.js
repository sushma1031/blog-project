const Post = require("../database/Post.js");
const cloudinary = require("cloudinary").v2;

module.exports = async (req, res) => {
  try {
    let post = await Post.findById(req.params.postID);
    if (post.image.id) {
      await cloudinary.uploader.destroy(post.image.id);
    }

    await post.deleteOne();
    res.redirect("/posts");
  } catch (err) {
    console.log(err.message);
  }
};