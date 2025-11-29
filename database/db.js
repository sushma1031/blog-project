const mongoose = require("mongoose");
const config = require("../config");

const connectDB = async () => {
  mongoose
    .connect(config.mongoURI)
    .then(() => console.log("Connected to Mongo."))
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });

  mongoose.set("sanitizeFilter", true);
};

const closeDBConn = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Error closing Mongo connection:", err);
    process.exit(1);
  }
};

module.exports = { connectDB, closeDBConn };
