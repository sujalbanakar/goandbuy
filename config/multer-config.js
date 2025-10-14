// config/multer-config.js
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // or use diskStorage if saving to disk

const upload = multer({storage: storage});

export default upload;
