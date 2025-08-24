const User = require("../database/User.js");

module.exports = async (req, res) => {
  const userID = req.params.userID;
  if (!userID) {
    return res.status(400).render("errors/400", {
      statusCode: 400,
      message: "User deletion error: No user ID provided.",
    });
  }
  
  if (userID !== req.session.userId) {
    console.warn("Danger: User trying to delete different user's account.");
    return res.status(403).render("errors/401", {
      statusCode: 403,
      message: "Forbidden action.",
    });
  } else {
    try {
      let user = await User.findOneAndDelete({ _id: userID });
      if (!user) {
        console.warn(`User deletion error: No user found for: ${userID}`);
        return res.status(404).render("errors/400", {
          statusCode: 404,
          message: "Invalid user provided.",
        });
      }
      console.log(`User deletion successful: ${user.username} (${userID}).`);
      req.session.destroy((error) => {
        if (error) {
          console.error(`User session deletion error: Error destroying session for user: ${userID}`, error);
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error(`Unexpected error while deleting user: ${userID}`, err);
      res.status(500).render("errors/500", {
        statusCode: 500,
        message: "An unexpected error occurred while deleting account.",
      });
    }
  }
};
