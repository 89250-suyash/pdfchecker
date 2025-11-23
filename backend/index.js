// backend/index.js

const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const textract = require("textract");  // ← NEW WORKING IMPORT
const { checkRuleWithLLM } = require("./llm");

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// ------------ PDF TEXT EXTRACTION (WORKS ON NODE 22) ---------------
function extractText(buffer) {
  return new Promise((resolve, reject) => {
    textract.fromBufferWithName("file.pdf", buffer, { preserveLineBreaks: true }, (error, text) => {
      if (error) reject(error);
      else resolve(text || "");
    });
  });
}
// -------------------------------------------------------------------


app.post("/check", async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    // Get rules from multipart/form-data
    let rules;
    try {
      rules = JSON.parse(req.body.rules);
      if (!Array.isArray(rules)) throw new Error("Rules must be an array.");
    } catch (e) {
      return res.status(400).json({ error: "Invalid rules format. Send rules as JSON array." });
    }

    const pdfFile = req.files.pdf;

    // Extract PDF text (using textract)
    const text = await extractText(pdfFile.data);

    // Process each rule with LLM
    const rulePromises = rules.map(rule => checkRuleWithLLM(text, rule));
    const results = await Promise.all(rulePromises);

    const passedCount = results.filter(r => r.status === "pass").length;

    res.json({
      summary: { total: results.length, passed: passedCount },
      results
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
