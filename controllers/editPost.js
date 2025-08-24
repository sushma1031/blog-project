const Post = require("../database/Post.js");
const sanitizeHtml = require("sanitize-html");
const cloudinary = require("cloudinary").v2;

const get = (req, res) => {
  Post.findOne({ _id: req.params.postID })
    .then((post) => {
      if (post) {
        let regex = /(^.*upload\/)(.*)/;
        let thumbnailUrl = "";
        if(post.image?.url)
          thumbnailUrl = post.image.url.replace(regex, `$1c_thumb,w_200,g_face/$2`);
        res.render("edit", {
          title: post.title,
          content: post.content,
          username: post.username,
          thumbnail: thumbnailUrl,
          imageSource: post.image.source,
        });
      } else {
        const arguments = {
          statusCode: "404",
          message: "Post not found.",
          redirect: "/posts",
          redirectText: "All Posts",
        };
        res.status(404).render("errors/404", arguments);
      }
    })
    .catch((error) => {
      console.error(`Unexpected error while fetching post for edit: ${req.params.postID}`, error);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "An unexpected error occurred.",
      });
    });
};

const post = async (req, res) => {
  try {
    let changeImage = true;
    if (!req.file || Object.keys(req.file).length === 0) {
      changeImage = false;
    }
    let modifiedPost = await Post.findById(req.params.postID);
    let fieldsToUpdate = Object.keys(req.body).filter((k) =>Boolean(req.body[k]));
    for (let field of fieldsToUpdate) {
      if (field === "imageSource") {
        modifiedPost.image.source = sanitizeHtml(req.body.imageSource, {
          allowedTags: ["a"],
          allowedAttributes: {
            a: ["href"],
          },
        });
      } else
        modifiedPost[field] =
          field === "content"
            ? sanitizeHtml(req.body[field])
            : req.body[field];
    }
    if (changeImage) {
      if (modifiedPost.image?.id) {
        try {
          await cloudinary.uploader.destroy(modifiedPost.image.id);
        } catch (error) {
          console.error(
            `Failed to delete previous image for post: ${req.params.postID}`,
            error
          );
          return res.status(500).render("errors/500", {
            statusCode: 500,
            message: "Failed to replace post image. Please try again later.",
          });
        }
      }
      modifiedPost.image.url = req.file.path;
      modifiedPost.image.id = req.file.filename;
    }
    await modifiedPost.save();
    res.redirect(`/posts/${req.params.postID}`);
  } catch (error) {
    console.error(`Unexpected error while updating post: ${req.params.postID}`, error);
    res.status(500).render("errors/500", {
      statusCode: 500,
      message: "An unexpected error occurred while saving changes.",
    });
  }
};

module.exports = { get, post };
