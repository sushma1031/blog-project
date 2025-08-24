const User = require("../database/User");

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  } else next();
};

const authenticate = (req, res, next) => {
  if (!req.session || !req.session.userId)
    return res.redirect("/login");

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

module.exports = {redirectIfAuthenticated, authenticate}