const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
const upload = multer();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    const prompt = `
You're a professional resume coach. Give a score out of 100, suggest 3–5 improvements, then rewrite the resume professionally.

Resume:
${resumeText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
