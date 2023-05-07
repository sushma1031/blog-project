const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: { type: String, default: "" },
  username: String,
  preview: { type: String, default: "" },
  image: {
    url: String,
    id: String,
    source: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;