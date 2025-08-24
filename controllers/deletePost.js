const Post = require("../database/Post.js");
const cloudinary = require("cloudinary").v2;

module.exports = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postID);
    if (!post) {
      console.warn(`Post deletion error: No post found for: ${req.params.postID}`);
      return res.status(404).render("errors/400", {
        statusCode: 404,
        message: "No post found with the given ID.",
      });
    }

    if (post.image?.id) {
      try {
        await cloudinary.uploader.destroy(post.image.id);
      } catch (err) {
        console.error(
          `Post deletion error: Failed to delete image for post: ${req.params.postID}`,
          err
        );
        return res.status(500).render("errors/500", {
          statusCode: 500,
          message: "Failed to delete post image.",
        });
      }
    }

    try {
      await post.deleteOne();
    } catch (err) {
      console.error(
        `Post deletion error: Failed to delete post from DB: ${req.params.postID}`,
        err
      );
      return res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to delete post due to a server error.",
      });
    }

    res.redirect("/posts");
  } catch (err) {
    console.error(`Unexpected error while deleting post: ${req.params.postID}`, err);
    res.status(500).render("errors/500", {
      statusCode: 500,
      message: "An unexpected error occurred while deleting the post.",
    });
  }
};