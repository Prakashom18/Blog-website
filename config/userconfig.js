const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { name } = require('ejs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
     crypto.randomBytes(12,(err,name)=>{
        name+path.extname(file.originalname);
    })
  }
})

const upload = multer({ storage: storage })

module.exports = upload;