const User = require("../database/User.js");

module.exports = (req, res) => {
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

  User.create(req.body)
    .then((registeredUser) => {
      req.session.userId = registeredUser._id;
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
