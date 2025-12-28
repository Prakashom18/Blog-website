const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/uploads")); // ✅ safe path
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, buffer) => {
      if (err) return cb(err);

      const filename =
        buffer.toString("hex") + path.extname(file.originalname);

      cb(null, filename); // ✅ STRING passed
    });
  }
});

const upload = multer({ storage });

module.exports = upload;
