const Post = require("../database/Post.js");
const date = require("../utils/date.js");

const getAllPosts = (req, res) => {
  Post.find({})
    .sort({ createdAt: -1 })
    .limit(3)
    .then((posts) => {
      posts.forEach((post) => {
        post.relativeDate = date.calcDate(post.createdAt);
      });
      res.render("home", {
        posts: posts,
      });
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
    return res.status(400).render("errors/500", {
      statusCode: 400,
      message: "Missing or empty value for 'title'.",
    });
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let filter = {
    title: new RegExp(escapedQuery, "i"),
  };

  // TODO: identify total matched so we can paginate
  Post.find(filter, { title: 1 })
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

module.exports = { getAllPosts, searchPosts };
