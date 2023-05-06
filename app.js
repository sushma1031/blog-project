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

const createPostController = require("./controllers/createPost.js");
const homePageController = require("./controllers/homePage.js");
const storePostController = require("./controllers/storePost.js");
const getPostController = require("./controllers/getPost.js");
const storeUserController = require("./controllers/storeUser.js");
const loginController = require("./controllers/login.js");
const loginUserController = require("./controllers/loginUser.js");
const redirectIfAuthenticated = require("./controllers/middlewareRedirect.js");

const Post = require("./database/Post.js");
const date = require("./date.js");

const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Cloud Database Connection
const mongoDBURL = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.1quaohb.mongodb.net/postsDB`;

mongoose.connect(mongoDBURL);

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

app.use(function (req, res, next) {
  res.locals = {
    auth: req.session.userId,
  };
  next();
});

//Routes

app.get("/", homePageController);

app.get("/about", (req, res) => {
  res.render("about", { content: aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact", { content: contactContent });
});

app.get("/posts", (req, res) => {
  Post.find({})
    .then((posts) => {
      posts.forEach((post) => {
        post.dateString = date.getDate(post.createdAt);
      });
      res.render("posts", {posts});
    })
    .catch((err) => console.log(err));
  
})

app.get("/register", redirectIfAuthenticated, (req, res) => {
  res.render("register");
});

app.post("/register", redirectIfAuthenticated, storeUserController);

app.get("/login", redirectIfAuthenticated, loginController);

app.post("/login", redirectIfAuthenticated, loginUserController);

app.get("/compose", createPostController);

app.post("/compose", parser.single("image"), storePostController);

app.get("/posts/:postID", getPostController);

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
    message: "We couldn’t find that page you’re looking for.",
    redirect: "/",
    button: "Go Home",
  };
  res.status(404).render("error", arguments);
});

app.listen(PORT, function () {
  console.log("Server started on port 3000");
});