const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { name } = require('ejs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
     const fn = crypto.randomBytes(12,(err,name)=>{
        name.toString("hex")+path.extname(file.originalname);
        cb(null,fn);
    })
  }
})

const upload = multer({ storage: storage })

module.exports = upload;