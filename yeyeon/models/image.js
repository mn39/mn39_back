// yeyeon/models/image.js
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  name: String,
  desc: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Image = mongoose.model('Image', imageSchema);
export default Image;
