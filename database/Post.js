const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: { type: String, default: "" },
  creator: { type: mongoose.Types.ObjectId, ref: "User" },
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