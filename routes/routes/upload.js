const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'bazaar-e-thrift' }, (err, result) => (err ? reject(err) : resolve(result)));
    stream.end(buffer);
  });
}

router.post('/', adminAuth, upload.array('images', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files received' });
    const results = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer)));
    res.json({ urls: results.map((r) => r.secure_url) });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed — check your Cloudinary credentials.' });
  }
});

module.exports = router;
