const User = require("../database/models/User.js");
const bcrypt = require("bcrypt");

const findByEmail = (email) => {
  return User.findOne({ email });
};

const validatePassword = (plaintext, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plaintext, hash, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const createUser = ({ username, email, password }) => {
  return User.create({ username, email, password });
};

const deleteUserById = (id) => {
  return User.findOneAndDelete({ _id: id });
};

module.exports = { findByEmail, validatePassword, createUser, deleteUserById };
