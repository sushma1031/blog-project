const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    creator: { type: mongoose.Types.ObjectId, ref: "User" },
    image: {
      url: String,
      id: String,
      source: String,
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
