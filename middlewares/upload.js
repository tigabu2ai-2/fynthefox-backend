const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["pdf", "jpeg", "jpg", "png"];
  if (!allowed.includes(file.mimetype.split("/")[1])) {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Invalid file type. Only PDF, JPEG, JPG, and PNG are allowed."
      )
    );
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
