const bcrypt = require("bcrypt");
const User = require("../database/User.js");

module.exports = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) { 
        return res.redirect("/login?error=invalidcredentials");
      }
      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (err) {
          console.error("Bcrypt error:", err);
          return res.redirect("/login?error=server");
        }
        if (result) {
          req.session.userId = foundUser._id;
          return res.redirect("/");
        }
        return res.redirect("/login?error=invalidcredentials");
      });
    })
    .catch((error) => {
      console.error(`Unexpected error while logging in user: ${email}`, error);
      res.redirect("/login?error=server")
    });
};