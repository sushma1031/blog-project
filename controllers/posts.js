const postService = require("../services/posts.js");
const date = require("../utils/date.js");
const config = require("../config.js");

const renderHome = (req, res) => {
  postService
    .getRecentPosts()
    .then((posts) => {
      posts.forEach((post) => {
        post.relativeDate = date.calcDate(post.createdAt);
      });
      res.render("home", { posts, defaultImage: config.defaultPostImage.url });
    })
    .catch((err) => {
      console.error("Unexpected error while fetching posts", err);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to fetch posts.",
      });
    });
};

const searchPosts = (req, res) => {
  const rawQuery = req.query["title"];
  let query;

  if (!(typeof rawQuery === "string") || (query = rawQuery.trim()) === "") {
    return res.status(400).render("errors/400", {
      statusCode: 400,
      message: "Missing or empty value for 'title'.",
    });
  }

  postService
    .searchPosts(query)
    .then((posts) => {
      posts.forEach((post) => {
        post.dateString = date.getDate(post.createdAt);
      });
      res.render("search", { posts, query });
    })
    .catch((err) => {
      console.error("Unexpected error while fetching posts", err);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to fetch posts.",
      });
    });
};

const getAllPosts = (req, res) => {
  postService
    .getAllPosts()
    .then((posts) => {
      posts.forEach((post) => {
        post.dateString = date.getDate(post.createdAt);
      });
      res.render("posts", { posts });
    })
    .catch((err) => {
      console.error("Unexpected error while fetching posts", err);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to fetch posts.",
      });
    });
};

const getPost = (req, res) => {
  postService
    .getPostById(req.params.postID)
    .then((post) => {
      if (post) {
        return res.render("post", {
          title: post.title,
          content: post.content,
          username: post.creator?.username || "Anonymous",
          datePosted: date.getDate(post.createdAt),
          imageURL: post.image?.url,
          imageSource: post.image?.source,
        });
      } else {
        return res.status(404).render("errors/404", {
          title: "Not Found",
          message: "We couldn't find the post you're looking for.",
          redirect: "/posts",
          redirectText: "All Posts",
        });
      }
    })
    .catch((error) => {
      console.error("Unexpected error while fetching post", error);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "An unexpected error occurred.",
      });
    });
};

const renderCompose = (req, res) => {
  res.render("compose");
};

const createPost = async (req, res) => {
  try {
    await postService.createPost({
      title: req.body.title,
      content: req.body.content,
      file: req.file && Object.keys(req.file).length > 0 ? req.file : null,
      imageSource: req.body.imageSource ? req.body.imageSource : "",
      userId: req.session.userId,
    });
    res.redirect("/");
  } catch (err) {
    if (err.code === "VALIDATION_ERROR") {
      return res.status(400).render("errors/400", {
        statusCode: 400,
        message: err.message,
      });
    }
    console.error("Unexpected error while storing post", err);
    res.status(500).render("errors/500", {
      statusCode: 500,
      message: "An unexpected error occurred while creating post.",
    });
  }
};

const renderEdit = (req, res) => {
  postService
    .getPostForEdit(req.params.postID)
    .then((post) => {
      if (post) {
        let regex = /(^.*upload\/)(.*)/;
        let thumbnailUrl = "";
        if (post.image?.url) thumbnailUrl = post.image.url.replace(regex, `$1c_thumb,w_200,g_face/$2`);
        res.render("edit", {
          title: post.title,
          content: post.content,
          username: post.username,
          thumbnail: thumbnailUrl,
          imageSource: post.image?.source || "",
        });
      } else {
        res.status(404).render("errors/404", {
          statusCode: 404,
          message: "Post not found.",
          redirect: "/posts",
          redirectText: "All Posts",
        });
      }
    })
    .catch((error) => {
      console.error(`Unexpected error while fetching post for edit: ${req.params.postID}`, error);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "An unexpected error occurred.",
      });
    });
};

const updatePost = async (req, res) => {
  try {
    await postService.updatePost(
      req.params.postID,
      req.body,
      req.file && Object.keys(req.file).length > 0 ? req.file : null,
    );
    res.redirect(`/posts/${req.params.postID}`);
  } catch (error) {
    if (error.code === "IMAGE_DELETE_FAILED") {
      console.error(`Failed to delete previous image for post: ${req.params.postID}`, error);
      return res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to replace post image. Please try again later.",
      });
    }
    console.error(`Unexpected error while updating post: ${req.params.postID}`, error);
    res.status(500).render("errors/500", {
      statusCode: 500,
      message: "An unexpected error occurred while saving changes.",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await postService.deletePostById(req.params.postID);
    if (!post) {
      console.warn(`Post deletion error: No post found for: ${req.params.postID}`);
      return res.status(404).render("errors/404", {
        statusCode: 404,
        message: "No post found with the given ID.",
      });
    }
    res.redirect("/posts");
  } catch (error) {
    if (error.code === "IMAGE_DELETE_FAILED") {
      console.error(`Post deletion error: Failed to delete image for post: ${req.params.postID}`, error);
      return res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to delete post image.",
      });
    }
    if (error.code === "DB_DELETE_FAILED") {
      console.error(`Post deletion error: Failed to delete post from DB: ${req.params.postID}`, error);
      return res.status(500).render("errors/500", {
        statusCode: 500,
        message: "Failed to delete post due to a server error.",
      });
    }
    console.error(`Unexpected error while deleting post: ${req.params.postID}`, error);
    res.status(500).render("errors/500", {
      statusCode: 500,
      message: "An unexpected error occurred while deleting the post.",
    });
  }
};

module.exports = {
  renderHome,
  searchPosts,
  getAllPosts,
  getPost,
  renderCompose,
  createPost,
  renderEdit,
  updatePost,
  deletePost,
};
