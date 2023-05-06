require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const PORT = process.env.PORT || 3000;

const date = require(__dirname + "/date.js");
const Post = require("./database/Post.js");

const saltRounds = 10;

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Cursis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const mongoDBURL =
  "mongodb+srv://admin-sushma:" +
  process.env.PASSWORD +
  "@cluster0.1quaohb.mongodb.net/postsDB";

mongoose.connect(mongoDBURL);

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

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  Post.find({})
    .then((posts) => {
      posts.forEach((post) => {
        post.relativeDate = date.calcDate(post.createdAt);
        post.preview = post.preview.concat(post.content);
      });
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts,
      });
    })
    .catch((err) => console.log(err));
});

app.get("/about", (req, res) => {
  res.render("about", { content: aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact", { content: contactContent });
});

app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/");
  } else return res.render("register");
});

app.post("/register", (req, res) => {
  if (req.body.email !== process.env.EMAIL) {
    const arguments = {
      statusCode: "Sorry :(",
      message:
        "You do not have permission to create an account. Please contact the owner of this blog.",
      redirect: "/contact",
      button: "Contact",
    };
    return res.render("error", arguments);
  }

  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    });

    newUser
      .save()
      .then((registeredUser) => {
        req.session.userId = registeredUser._id;
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  });
});

app.get("/login", (req, res) => {
  let message;
  switch (req.query.error) {
    case "invalidemail":
      message = "This email is not registered.";
      break;
    case "incorrectpassword":
      message = "Incorrect password.";
      break;
    default:
      message = undefined;
  }

  if (req.session.userId) {
    return res.redirect("/");
  } else return res.render("login", { errorMessage: message });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((foundUser) => {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result) {
            req.session.userId = foundUser._id;
            res.redirect("/");
          } else res.redirect("/login?error=incorrectpassword");
        });
      } else res.redirect("/login?error=invalidemail");
    })
    .catch((error) => console.log(error));
});

app.get("/compose", (req, res) => {
  if (req.session.userId) {
    User.findById(req.session.userId)
      .then((user) => {
        if (!user) {
          return res.redirect("/login");
        } else return res.render("compose");
      })
      .catch((error) => {
        console.log(error.message);
        return res.redirect("/");
      });
  } else return res.redirect("/login");
});

app.post("/compose", parser.single("image"), (req, res) => {
  if (!req.file || Object.keys(req.file).length === 0) {
     return res.status(400).send("No files were uploaded.");
  }
  const image = {
    url: req.file.path,
    id: req.file.filename,
    source: req.body.imageSource
  }

  Post.create({
    ...req.body,
    image,
  })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

app.get("/posts/:postID", (req, res) => {
  Post.findOne({ _id: req.params.postID })
    .then((post) => {
      if (post) {
        const day = date.getDate(post.createdAt);
        res.render("post", {
          title: post.title,
          content: post.content,
          username: post.username,
          datePosted: day,
          image: post.image.url,
          imageSource: post.image.source,
        });
      }
    })
    .catch((error) => {
      const arguments = {
        statusCode: "404",
        message: "We couldn’t find that page you’re looking for.",
        redirect: "/",
        button: "Go Home",
      };
      res.status(404).render("error", arguments);
    });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
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
