const Post = require("../database/models/Post.js");
const { ObjectId } = require("mongoose").Types;
const sanitizeHtml = require("sanitize-html");
const cloudinary = require("cloudinary").v2;

const getRecentPosts = (count = 3) => {
  return Post.find({}).sort({ createdAt: -1 }).limit(count);
};

const getAllPosts = () => {
  return Post.find({}, { creator: 0 }).sort({ createdAt: -1 });
};

const searchPosts = (query) => {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = { title: new RegExp(escapedQuery, "i") };
  return Post.find(filter, { title: 1 });
};

const getPostById = (id) => {
  return Post.findOne({ _id: id }).populate("creator", "username");
};

const getPostForEdit = (id) => {
  return Post.findById(id);
};

const createPost = ({ title, content, imageUrl, imageId, imageSource, userId }) => {
  const sanitizedContent = sanitizeHtml(content);
  const sanitizedImageSource = sanitizeHtml(imageSource, {
    allowedTags: ["a"],
    allowedAttributes: { a: ["href"] },
  });

  return Post.create({
    title: title.trim(),
    content: sanitizedContent,
    creator: new ObjectId(userId),
    image: { url: imageUrl, id: imageId, source: sanitizedImageSource },
  });
};

const updatePost = async (id, fields, newFile) => {
  const modifiedPost = await Post.findById(id);
  if (!modifiedPost) return null;

  const fieldsToUpdate = Object.keys(fields).filter((k) => Boolean(fields[k]));
  for (const field of fieldsToUpdate) {
    if (field === "imageSource") {
      modifiedPost.image.source = sanitizeHtml(fields.imageSource, {
        allowedTags: ["a"],
        allowedAttributes: { a: ["href"] },
      });
    } else {
      modifiedPost[field] = field === "content" ? sanitizeHtml(fields[field]) : fields[field];
    }
  }

  if (newFile) {
    if (modifiedPost.image?.id) {
      try {
        await cloudinary.uploader.destroy(modifiedPost.image.id);
      } catch (error) {
        const err = new Error("Failed to delete previous image");
        err.code = "IMAGE_DELETE_FAILED";
        throw err;
      }
    }
    modifiedPost.image.url = newFile.path;
    modifiedPost.image.id = newFile.filename;
  }

  await modifiedPost.save();
  return modifiedPost;
};

const deletePostById = async (id) => {
  const post = await Post.findById(id);
  if (!post) return null;

  if (post.image?.id) {
    try {
      await cloudinary.uploader.destroy(post.image.id);
    } catch (err) {
      const error = new Error("Failed to delete post image");
      error.code = "IMAGE_DELETE_FAILED";
      throw error;
    }
  }

  try {
    await post.deleteOne();
  } catch (err) {
    const error = new Error("Failed to delete post from DB");
    error.code = "DB_DELETE_FAILED";
    throw error;
  }

  return post;
};

module.exports = {
  getRecentPosts,
  getAllPosts,
  searchPosts,
  getPostById,
  getPostForEdit,
  createPost,
  updatePost,
  deletePostById,
};
