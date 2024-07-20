import multer from "multer";
import path from 'path'
import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('filer', file)
    if (file.fieldname === 'NewImageFile') {
      cb(null, path.join('images/userImage/'));
    } else {
      cb(null, path.join('images/'));
    }
  },
  filename: (req, file, cb) => {
    cb(null, 'userImage' + '-' + Date.now() + path.extname(file.originalname));
  },
})
 const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png','image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(null, false); // Reject file
  }
};

export const multerFileUpload = multer({storage:storage,fileFilter:fileFilter}).any()
