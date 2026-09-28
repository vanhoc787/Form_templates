const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const mammoth = require('mammoth');

async function saveFileLocal(buffer, originalname) {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  await fs.ensureDir(uploadsDir);
  const safeName = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
  const fullPath = path.join(uploadsDir, safeName);
  await fs.writeFile(fullPath, buffer);
  return { fullPath, relPath: `uploads/${safeName}`, size: buffer.length };
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function extractTextFromDocx(buffer) {
  const res = await mammoth.extractRawText({ buffer });
  return (res.value || '').trim();
}

// simple chunker by characters with overlap
function chunkTextSimple(text, chunkSize = 2000, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    const piece = text.substring(start, end);
    const tokens = piece.split(/\s+/).filter(Boolean).length;
    chunks.push({ text: piece, start, end, tokens });
    if (end === text.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

module.exports = { saveFileLocal, sha256, extractTextFromDocx, chunkTextSimple };
