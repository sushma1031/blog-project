const Post = require("../database/Post.js");
const sanitizeHtml = require("sanitize-html");

module.exports = (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    return res.status(400).send("No files were uploaded.");
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
    content: sanitizedContent,
    image,
  })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};