const config = require("./config.js");
const express = require("express");
const ejs = require("ejs");
const { connectDB, closeDBConn } = require("./database/db.js");
const parser = require("./middleware/cloudinary-upload.js");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Enabling Sessions
const TWELVE_HOURS = 1000 * 60 * 60 * 12;
app.use(
  expressSession({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create({
      mongoUrl: config.mongoURI,
    }),
    cookie: {
      maxAge: TWELVE_HOURS,
    },
  })
);

const createPostController = require("./controllers/createPost.js");
const homePageController = require("./controllers/homePage.js");
const getAllPostsController = require("./controllers/getAllPosts.js");
const storePostController = require("./controllers/storePost.js");
const getPostController = require("./controllers/getPost.js");
const storeUserController = require("./controllers/storeUser.js");
const getUserController = require("./controllers/getUser.js");
const loginController = require("./controllers/login.js");
const loginUserController = require("./controllers/loginUser.js");
const logoutUserController = require("./controllers/logoutUser.js");
const editPostController = require("./controllers/editPost.js");
const deletePostController = require("./controllers/deletePost.js");
const deleteUserController = require("./controllers/deleteUser.js");
const {
  redirectIfAuthenticated,
  authenticate,
} = require("./middleware/auth.js");

app.use(function (req, res, next) {
  res.locals = {
    auth: req.session.userId,
    scripts: config.scripts,
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

app.get("/compose", authenticate, createPostController);

app.post("/compose", authenticate, parser.single("image"), storePostController);

app.get("/posts/:postID", getPostController);

app.get("/posts/:postID/edit", authenticate, editPostController.get);

app.post("/posts/:postID/edit", authenticate, parser.single("image"), editPostController.post);

app.get("/posts/:postID/delete", authenticate, deletePostController);

app.get("/logout", logoutUserController);

app.get("/users/:userID/delete", authenticate, deleteUserController);

app.use((req, res, next) => {
  res.status(404).render("errors/404", { title: "Page Not Found" });
});

const server = app.listen(config.port, function () {
  console.log(`Server started on port ${config.port}`);
});

let isShuttingDown = false;
const shutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("\nReceived kill signal, shutting down gracefully");

  server.close(async () => {
    console.log("Closing remaining connections");
    closeDBConn();
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
