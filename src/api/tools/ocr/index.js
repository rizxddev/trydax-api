import Tesseract from 'tesseract.js';

export default async function handler(req, res) {
  const creator = "TryDax";
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator,
      message: "Image URL parameter is required."
    });
  }

  try {
    const { data: { text, confidence } } = await Tesseract.recognize(url, 'eng+ind');

    res.json({
      status: true,
      code: 200,
      creator,
      result: {
        text: text.trim(),
        language: "eng+ind",
        confidence: confidence
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "OCR failed: " + error.message
    });
  }
}
