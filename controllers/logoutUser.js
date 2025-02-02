module.exports = (req, res) => {
  if (req.session && req.session.userId) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  } else {
    res.redirect("/login");
  }
};