const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only images are allowed'));
    }

    cb(null, true);
  },
});

/**
 * =========================
 * GENERATE SAFE FILE NAME
 * =========================
 */
const generateFileName = (originalname) => {
  const ext = path.extname(originalname);
  const name = crypto.randomBytes(16).toString('hex');
  return `${name}${ext}`;
};

// -------------------- LOCAL FILE UPLOAD --------------------=
router.post('/local', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadDir = path.join(__dirname, '../uploads');

    const savedFiles = await Promise.all(
      req.files.map(async (file) => {
        const fileName = generateFileName(file.originalname);
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, file.buffer); 

        return `/uploads/${fileName}`;
      })
    );

    res.json({
      message: 'Files uploaded successfully',
      urls: savedFiles,
    });
  } catch (err) {
    console.error('Local upload error:', err);

    res.status(500).json({
      message: 'Local upload failed',
    });
  }
});

// -------------------- CLOUDINARY UPLOAD --------------------
router.post('/cloud', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const results = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'thinkly',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );

          stream.end(file.buffer);
        });
      })
    );

    res.json({
      message: 'Files uploaded successfully',
      urls: results,
    });
  } catch (err) {
    console.error('Cloud upload error:', err);

    res.status(500).json({
      message: 'Cloud upload failed',
    });
  }
});

module.exports = router;
