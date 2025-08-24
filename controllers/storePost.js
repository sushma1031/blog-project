const Post = require("../database/Post.js");
const { ObjectId } = require("mongoose").Types
const sanitizeHtml = require("sanitize-html");

module.exports = (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    return res.status(400).send("No image uploaded.");
  }
  if (req.body.content === '') {
    return res.status(400).send("No content provided.");
  }
  const image = {
    url: req.file.path,
    id: req.file.filename,
    source: sanitizeHtml(req.body.imageSource, {
      allowedTags: ['a'],
      allowedAttributes: {
        'a': ['href']
      }
    })
  };

  const { imageSource, content, ...post } = req.body;
  const sanitizedContent = sanitizeHtml(content);

  Post.create({
    ...post,
    creator: new ObjectId(req.session.userId),
    content: sanitizedContent,
    image,
  })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.error("Unexpected error while storing post", err);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "An unexpected error occurred while creating post.",
      });
    });
};