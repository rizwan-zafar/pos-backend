// Use ViT (Vision Transformer) for image embeddings
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const PYTHON_URL = process.env.LIDRAH_PYTHON || 'http://localhost:8000';

// Cosine similarity for embeddings
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract embedding for an image using FastAPI microservice
async function getImageEmbedding(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const formData = new FormData();
  formData.append('file', imageBuffer, 'image.png');
  try {
    const response = await axios.post(`${PYTHON_URL}/embed`, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 20000, // 20s timeout for slow model loads
    });
    if (!response.data.embedding) {
      throw new Error('No embedding returned from microservice');
    }
    return response.data.embedding;
  } catch (err) {
    console.error('Error calling FastAPI microservice:', err.message);
    throw new Error('Failed to get embedding from FastAPI microservice. Is it running on the correct URL?');
  }
}

exports.visualSearch = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    // Get embedding for uploaded image using FastAPI microservice
    const uploadedEmbedding = await getImageEmbedding(req.file.path);

    // Load product embeddings (should be generated with the same microservice)
    const productEmbeddings = JSON.parse(fs.readFileSync('./product_embeddings.json'));
    const products = await Product.findAll();

    let matches = [];
    for (const product of products) {
      const file = product.image.split('/').pop();
      const emb = productEmbeddings[file];
      if (!emb) continue;
      const similarity = cosineSimilarity(uploadedEmbedding, emb);
      matches.push({ product, similarity });
    }

    matches.sort((a, b) => b.similarity - a.similarity);
    const topMatches = matches.slice(0, 5).map(m => ({
      ...m.product.dataValues,
      similarity: m.similarity
    }));

    res.json({ matches: topMatches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}; 