const axios = require('axios');

/**
 * LangChain Embeddings adapter that calls OpenAI embeddings API.
 * Uses model `text-embedding-3-small` by default. Supports `OPENAI_API_KEY`
 * and optional `OPENAI_API_BASE` (for compatible endpoints).
 */
class OpenAIEmbeddings {
  constructor({ apiKey, apiBase, model = 'text-embedding-3-small', timeout = 30000 } = {}) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.apiBase = apiBase || process.env.OPENAI_API_BASE || 'https://api.openai.com';
    this.model = model || process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';
    this.timeout = timeout;
    if (!this.apiKey) console.warn('OPENAI_API_KEY not set — embedding requests will fail');
  }

  async _callOpenAI(texts) {
    const url = `${this.apiBase.replace(/\/$/, '')}/v1/embeddings`;
    const payload = { model: this.model, input: texts };
    const res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      timeout: this.timeout,
    });
    // OpenAI response shape: { data: [{ embedding: [...] }, ...] }
    if (!res?.data?.data) throw new Error('Invalid response from OpenAI embeddings API');
    return res.data.data.map(d => d.embedding);
  }

  async embedDocuments(documents) {
    if (!Array.isArray(documents)) documents = [documents];
    const texts = documents.map(d => (typeof d === 'string' ? d : String(d)));
    const embeddings = await this._callOpenAI(texts);
    return embeddings;
  }

  async embedQuery(text) {
    const out = await this._callOpenAI([text]);
    return out[0];
  }
}

module.exports = { OpenAIEmbeddings };
