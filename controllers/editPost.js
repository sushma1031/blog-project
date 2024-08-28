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
          message: "No such post.",
          redirect: "/posts",
          button: "All Posts",
        };
        res.status(404).render("error", arguments);
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.redirect("/");
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
        await cloudinary.uploader.destroy(modifiedPost.image.id);
      }
      modifiedPost.image.url = req.file.path;
      modifiedPost.image.id = req.file.filename;
    }
    await modifiedPost.save();
    res.redirect(`/posts/${req.baseUrl}`);
  } catch (error) {
    console.log(error.message);
  }

};

module.exports = { get, post };
