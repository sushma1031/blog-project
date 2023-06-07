require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const PORT = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Cloud Database Connection
const mongoDBURL = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.1quaohb.mongodb.net/postsDB`;

mongoose.connect(mongoDBURL)
  .then(() => console.log("Connected to Mongo."))
  .catch(err => console.log(err.message));

//Enabling Sessions
app.use(
  expressSession({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create({
      mongoUrl: mongoDBURL,
    }),
  })
);

//Cloud Image Storage
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tia-blog-images",
    allowedFormats: ["jpg", "png"],
    transformation: [{ width: 1280, height: 720, crop: "fill" }],
  },
});
const parser = multer({ storage: storage });

const createPostController = require("./controllers/createPost.js");
const homePageController = require("./controllers/homePage.js");
const getAllPostsController = require("./controllers/getAllPosts.js");
const storePostController = require("./controllers/storePost.js");
const getPostController = require("./controllers/getPost.js");
const storeUserController = require("./controllers/storeUser.js");
const getUserController = require("./controllers/getUser.js");
const loginController = require("./controllers/login.js");
const loginUserController = require("./controllers/loginUser.js");
const redirectIfAuthenticated = require("./controllers/middleware.js").redirect;
const auth = require("./controllers/middleware.js").auth;
const deletePostController = require("./controllers/deletePost.js");

app.use(function (req, res, next) {
  res.locals = {
    auth: req.session.userId,
  };
  next();
});

//Routes

app.get("/", homePageController);

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/posts", getAllPostsController);

app.get("/register", redirectIfAuthenticated, getUserController);

app.post("/register", redirectIfAuthenticated, storeUserController);

app.get("/login", redirectIfAuthenticated, loginController);

app.post("/login", redirectIfAuthenticated, loginUserController);

app.get("/compose", auth, createPostController);

app.post("/compose", parser.single("image"), storePostController);

app.get("/posts/:postID", getPostController);

app.get("/delete/:postID", auth, deletePostController);

app.get("/logout", (req, res) => {
  if (req.session.userId) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/login");
  }
});

app.use((req, res, next) => {
  const arguments = {
    statusCode: "404",
    message: "We couldn’t find the page you’re looking for.",
    redirect: "/",
    button: "Go Home",
  };
  res.status(404).render("error", arguments);
});

app.listen(PORT, function () {
  console.log("Server started on port 3000");
});