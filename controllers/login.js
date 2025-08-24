module.exports = (req, res) => {
  let message;
  switch (req.query.error) {
    case "server":
      message = "Internal server error."
      break;
    case "invalidcredentials":
      message = "Invalid credentials provided.";
      break;
    default:
      message = undefined;
  }
  res.render("login", { errorMessage: message });
};
