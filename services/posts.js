const Post = require("../database/models/Post.js");
const { ObjectId } = require("mongoose").Types;
const sanitizeHtml = require("sanitize-html");
const cloudinary = require("cloudinary").v2;
const config = require("../config.js");

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

const createPost = ({ title, content, file, imageSource, userId }) => {
  if (!title || title.trim().length === 0 || !content) {
    const err = new Error("Title or content cannot be empty.");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  let imageData = undefined;

  if (file != null) {
    if (!imageSource || imageSource.trim().length === 0) {
      const err = new Error("Provide the source/credit for the uploaded image.");
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    imageData = {
      url: file.path,
      id: file.filename,
      source: sanitizeHtml(imageSource, {
        allowedTags: ["a"],
        allowedAttributes: { a: ["href"] },
      }),
    };
  }

  const sanitizedContent = sanitizeHtml(content);

  return Post.create({
    title: title.trim(),
    content: sanitizedContent,
    creator: new ObjectId(userId),
    image: imageData,
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
      console.log(`Failed to delete image for post: ${id}. Error:`, err);
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
