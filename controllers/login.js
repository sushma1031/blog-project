module.exports = (req, res) => {
  let message;
  switch (req.query.error) {
    case "invalidemail":
      message = "This email is not registered.";
      break;
    case "incorrectpassword":
      message = "Incorrect password.";
      break;
    default:
      message = undefined;
  }
  res.render("login", { errorMessage: message });
};
