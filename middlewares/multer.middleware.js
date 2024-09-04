import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

dotenv.config();
// Retrieve the current file's path and directory name
// Uncomment these lines if needed in your project setup
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  // Define the destination folder based on the field name
  destination: function (req, file, cb) {
    console.log('file', file);
    if (file.fieldname === 'NewImageFile') {
      // Save images for 'NewImageFile' in 'images/userImage/'
      cb(null, path.join(`images/userImage/`));
    } else {
      // Save other files in 'images/'
      cb(null, path.join('images/'));
    }
  },
  // Define the filename to be saved
  filename: (req, file, cb) => {
    // Format the filename with a timestamp and original file extension
    cb(null, 'userImage-' + Date.now() + path.extname(file.originalname));
  },
});

// Filter files based on MIME types
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
  // Check if the file's MIME type is in the allowed list
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(null, false); // Reject file
  }
};

// Export multer middleware for file uploads
export const multerFileUpload = multer({ storage: storage, fileFilter: fileFilter }).any();
