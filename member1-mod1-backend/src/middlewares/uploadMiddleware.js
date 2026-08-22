const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../attachments');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage: storage });

// It is crucial this is exported directly without curly braces
module.exports = upload;