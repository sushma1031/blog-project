const express = require("express");
const router = express.Router();
const postsController = require("../controllers/posts.js");
const { authenticate } = require("../middleware/auth.js");
const upload = require("../middleware/cloudinary-upload.js");

router.get("/", postsController.renderHome);
router.get("/search", postsController.searchPosts);
router.get("/posts", postsController.getAllPosts);

router.get("/compose", authenticate, postsController.renderCompose);
router.post("/compose", authenticate, upload.single("image"), postsController.createPost);

router.get("/posts/:postID", postsController.getPost);
router.get("/posts/:postID/edit", authenticate, postsController.renderEdit);
router.post("/posts/:postID/edit", authenticate, upload.single("image"), postsController.updatePost);
router.get("/posts/:postID/delete", authenticate, postsController.deletePost);

module.exports = router;
