require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const PROJECT_ENV = process.env.PROJECT_ENV || "dev";
const PORT = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Cloud Database Connection
const mongoDBURL =
  PROJECT_ENV === "dev"
    ? "mongodb://localhost:27017/postsDB"
    : `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.1quaohb.mongodb.net/postsDB`;

mongoose
  .connect(mongoDBURL)
  .then(() => console.log("Connected to Mongo."))
  .catch((err) => console.log(err.message));

mongoose.set("sanitizeFilter", true);

//Enabling Sessions
const TWELVE_HOURS = 1000 * 60 * 60 * 12;
app.use(
  expressSession({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create({
      mongoUrl: mongoDBURL,
    }),
    cookie: {
      maxAge: TWELVE_HOURS
    }
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
const logoutUserController = require("./controllers/logoutUser.js");
const editPostController = require("./controllers/editPost.js");
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

app.post("/compose", auth, parser.single("image"), storePostController);

app.get("/posts/:postID", getPostController);

app.get("/edit/:postID", auth, editPostController.get);

app.post("/edit/:postID", auth, parser.single("image"), editPostController.post);

app.get("/delete/posts/:postID", auth, deletePostController);

app.get("/logout", logoutUserController);

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
  console.log(`Server started on port ${PORT}`);
});