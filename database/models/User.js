const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: String,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, function (error, hash) {
    if (error) {
      return next(error);
    }

    this.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
