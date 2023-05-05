require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fileUpload = require("express-fileupload");
const date = require(__dirname + "/date.js");
const PORT = process.env.PORT || 3000;

const saltRounds = 10;

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Cursis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-sushma:" + process.env.PASSWORD + "@cluster0.1quaohb.mongodb.net/postsDB"
);

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  username: String,
  preview: {type: String, default: ""},
  image: {
    path: String,
    source: String
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Post = mongoose.model("Post", postSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  Post.find({})
    .then((posts) => {
      posts.forEach(post => {
        post.relativeDate = date.calcDate(post.createdAt)
        post.preview = post.preview.concat(post.content);
      })
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
  res.render("register");
})

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash
    });

    newUser
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((foundUser) => {
      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (result)
          res.redirect("/");
        else
          res.redirect("/login");
      });
    })
    .catch((err) => console.log(err));
  
})

app.get("/posts/new", (req, res) => {
  res.render("compose");
});

app.post("/posts/new", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const image = req.files.image;
  const uploadPath = __dirname + "/public/postImages/" + image.name;

  image.mv(uploadPath, (error) => {
    if (error) {
      return res.status(500).send(error.message);
    }
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody,
      username: req.body.username,
      preview: req.body.preview,
      image: {
        path: `/postImages/${image.name}`,
        source: req.body.imageSource
      }
    });
    
    post
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  });
});
  

app.get("/posts/:postID", (req, res) => {
  Post.findOne({ _id: req.params.postID })
    .then((post) => {
      const day = date.getDate(post.createdAt)
      // const decodedSrc = codec.decodeHTML(post.image.source);
      // console.log("post.image.source: " + post.image.source);
      // console.log("decodedSrc: " + decodedSrc);
      res.render("post", {
        title: post.title, content: post.content, username: post.username,
        datePosted: day, postImage: post.image.path, imageSource: post.image.source
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

app.use((req, res, next) => {
  res.status(404).render("error");
});

app.listen(PORT, function () {
  console.log("Server started on port 3000");
});
