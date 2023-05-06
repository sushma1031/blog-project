const User = require("../database/User.js");

module.exports = (req, res) => {
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
};
