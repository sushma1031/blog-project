const Post = require("../database/Post.js");

module.exports = (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const image = {
    url: req.file.path,
    id: req.file.filename,
    source: req.body.imageSource,
  };

  Post.create({
    ...req.body,
    image,
  })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};