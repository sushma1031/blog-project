const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const config = require("../config");

cloudinary.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tia-blog-images",
    allowedFormats: ["jpg", "png"],
    transformation: [{ width: 1280, height: 720, crop: "fill" }],
  },
});

module.exports = multer({ storage: storage });
