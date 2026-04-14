const express = require("express");
const router = express.Router();
const postsController = require("../controllers/posts.js");
const { authenticate } = require("../middleware/auth.js");
const upload = require("../middleware/cloudinary-upload.js");

router.get("/", postsController.renderHome);
router.get("/search", postsController.searchPosts);
router.get("/posts", postsController.renderAllPosts);

router.get("/compose", authenticate, postsController.renderCompose);

router.get("/posts/drafts", authenticate, postsController.getAllDrafts);
router.post("/posts/drafts", authenticate, upload.single("image"), postsController.createDraft);
router.get("/posts/drafts/:postID", postsController.renderDraft);

router.post("/posts", authenticate, upload.single("image"), postsController.createPost);
router.get("/posts/:postID", postsController.renderPost);
router.get("/posts/:postID/edit", authenticate, postsController.renderEdit);
router.post("/posts/:postID/edit", authenticate, upload.single("image"), postsController.updatePost);
router.post("/posts/:postID/publish", authenticate, upload.single("image"), postsController.publishDraft);
router.get("/posts/:postID/delete", authenticate, postsController.deletePost);

module.exports = router;
