const User = require("../database/User.js");

module.exports = async (req, res) => {
  const userID = req.params.userID;
  if (!userID) res.sendStatus(400);
  if (userID !== req.session.userId) {
    console.log("Danger: User trying to delete different user's account.");
    return;
  } else {
    try {
      let user = await User.findOneAndDelete({ _id: userID });
      if (!user) {
        console.log("Error: No such user");
      } else {
        console.log(`User ${user.username} deleted successfully.`)
        req.session.destroy(() => {
          res.redirect("/");
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};
