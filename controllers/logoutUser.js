module.exports = (req, res) => {
  if (req.session && req.session.userId) {
    req.session.destroy((err) => {
      if (err) {
        console.error(`Error destroying session for user: ${req.session.userId}`, err);
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  } else {
    res.redirect("/login");
  }
};