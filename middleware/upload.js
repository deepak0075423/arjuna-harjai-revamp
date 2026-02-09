const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'assets', 'uploads');
const videosDir = path.join(__dirname, '..', 'assets', 'videos');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, videosDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const imageFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.split('/')[1]);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
};

const videoFilter = (req, file, cb) => {
    const allowed = /mp4|mov|webm/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('Only video files (mp4, mov, webm) are allowed'));
};

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFilter,
    limits: { fileSize: 200 * 1024 * 1024 }
});

module.exports = { uploadImage, uploadVideo };
