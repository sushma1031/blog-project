const Post = require("../database/Post.js");
const date = require("../date.js");

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Cursis molestie a iaculis at erat pellentesque adipiscing.";

module.exports = (req, res) => {
  Post.find({})
    .sort({ createdAt: -1 })
    .limit(3)
    .then((posts) => {
      posts.forEach((post) => {
        post.relativeDate = date.calcDate(post.createdAt);
      });
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts,
      });
    })
    .catch((err) => console.log(err));
};
