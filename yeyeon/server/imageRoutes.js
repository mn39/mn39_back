// server/imageRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Image from '../models/image.js';
import mongoose from 'mongoose';

const router = express.Router();

// Multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// DB 연결 (Mongoose)
// app.js에서는 이미 연결되어 있겠지만, 단독으로 사용할 때를 고려해 한번 더 작성
if (!mongoose.connection.readyState) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Mongoose connected for images'))
    .catch((err) => console.error(err));
}

// GET /images – 저장된 이미지 목록 반환
router.get('/images', async (req, res) => {
  try {
    const images = await Image.find({});
    res.json(
      images.map((img) => ({
        id: img._id,
        name: img.name,
        desc: img.desc,
        data: `data:${img.img.contentType};base64,${img.img.data.toString(
          'base64'
        )}`,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// POST /upload – 이미지 업로드
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name, desc } = req.body;
    const filePath = path.join('uploads', req.file.filename);
    const imgData = fs.readFileSync(filePath);

    const newImg = await Image.create({
      name,
      desc,
      img: {
        data: imgData,
        contentType: req.file.mimetype,
      },
    });

    res.status(201).json({ message: 'Upload successful', id: newImg._id });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
