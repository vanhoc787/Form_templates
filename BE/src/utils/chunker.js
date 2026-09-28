exports.chunkTextSimple = function(text, { chunkSize = 1000, overlap = 50 }) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    const chunkText = text.substring(start, end);
    // approximate tokens = word count
    const tokens = chunkText.split(/\s+/).filter(Boolean).length;
    chunks.push({ text: chunkText, start, end, tokens });
    start = end - overlap; // overlap
    if (start < 0) start = 0;
    if (end === text.length) break;
  }
  return chunks;
};