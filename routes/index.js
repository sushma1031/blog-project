const express = require("express");
const router = express.Router();

const postsRoutes = require("./posts.js");
const usersRoutes = require("./users.js");

router.get("/about", (req, res) => res.render("about"));
router.get("/contact", (req, res) => res.render("contact"));

router.use(postsRoutes);
router.use(usersRoutes);

module.exports = router;
