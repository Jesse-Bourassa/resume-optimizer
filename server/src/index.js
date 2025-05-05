const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");
const stripeRoutes = require("./routes/stripe");
require("dotenv").config();

console.log("cwd:", process.cwd());  // ➊ where Node was started
console.log("env file?:", !!process.env.OPENAI_API_KEY); // ➋ true/false
console.log("first 8 chars:", (process.env.OPENAI_API_KEY || "").slice(0, 8)); // ➌

const app = express();
app.use(cors());
const upload = multer();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    console.log("REQ FILE:", req.file);
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

app.use("/api/stripe", stripeRoutes);

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
