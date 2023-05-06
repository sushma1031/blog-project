const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: String,
});

userSchema.pre("save", function (next) {
  const user = this;

  bcrypt.hash(user.password, 10, function (error, hash) {
    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);

module.exports = User;