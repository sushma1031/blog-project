const User = require("../database/User");

const redirect = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/");
  }
  else
    next();
};

const auth = (req, res, next) => {
User.findById(req.session.userId)
      .then((user) => {
        if (!user) {
          return res.redirect("/login");
        } else {
          res.locals.username = user.username;
          return next();
        }
      })
      .catch((error) => {
        console.log(error.message);
        return res.redirect("/login");
      });
};

module.exports = {redirect, auth}