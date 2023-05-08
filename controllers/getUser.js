module.exports = (req, res) => {
  let message;
  switch (req.query.error) {
    case "alreadyregistered":
      message = "This email is already registered.";
      break;
    default:
      message = undefined;
  }
  res.render("register", { errorMessage: message });
};