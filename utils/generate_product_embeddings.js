const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Product = require('../models/Product'); // Fixed import for default export

const imagesDir = path.join(__dirname, '../upload');
const outputFile = path.join(__dirname, '../product_embeddings.json');
const PYTHON_URL = process.env.LIDRAH_PYTHON || 'http://localhost:8000';

async function getImageEmbedding(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const formData = new FormData();
  formData.append('file', imageBuffer, path.basename(imagePath));
  const response = await axios.post(`${PYTHON_URL}/embed`, formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return response.data.embedding;
}

(async () => {
  try {
    // Load existing embeddings if present
    const existingEmbeddings = fs.existsSync(outputFile)
      ? JSON.parse(fs.readFileSync(outputFile))
      : {};
    // Get all products from DB
    const products = await Product.findAll();
    let updated = false;
    for (const product of products) {
      if (!product.image) continue;
      let imageFilename = product.image;
      if (imageFilename.includes('/')) {
        imageFilename = imageFilename.substring(imageFilename.lastIndexOf('/') + 1);
      }
      if (existingEmbeddings[imageFilename]) {
        console.log('Already exists, skipping:', imageFilename);
        continue;
      }
      const imgPath = path.join(imagesDir, imageFilename);
      if (!fs.existsSync(imgPath)) {
        console.warn('Image not found:', imgPath);
        continue;
      }
      try {
        const emb = await getImageEmbedding(imgPath);
        existingEmbeddings[imageFilename] = emb;
        updated = true;
        console.log('Processed:', imageFilename);
      } catch (err) {
        console.error('Failed:', imageFilename, err.message);
      }
    }
    if (updated) {
      fs.writeFileSync(outputFile, JSON.stringify(existingEmbeddings));
      console.log('Embeddings updated and saved to', outputFile);
    } else {
      console.log('No new embeddings to add.');
    }
  } catch (err) {
    console.error('Error generating embeddings:', err.message);
  }
})(); 