const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: { type: String, default: "" },
  creator: mongoose.Types.ObjectId,
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

postSchema.pre("save", async function (next) {
  try {
    const user = await mongoose.model("User").findById(this.creator);
    if (!user) {
      throw new Error("Invalid user");
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;