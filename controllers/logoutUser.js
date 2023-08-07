module.exports = (req, res) => {
  if (req.session.userId) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/login");
  }
};