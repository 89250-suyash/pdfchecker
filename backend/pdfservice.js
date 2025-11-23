const pdfParse = require('pdf-parse');

async function extractTextFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (e) {
    throw new Error('PDF text extraction failed: ' + e.message);
  }
}

module.exports = { extractTextFromPdf };