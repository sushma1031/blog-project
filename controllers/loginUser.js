const bcrypt = require("bcrypt");
const User = require("../database/User.js");

module.exports = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
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
};