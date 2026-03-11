import sharp from 'sharp';
import fetch from 'node-fetch';

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
    const response = await fetch(url);
    const buffer = await response.buffer();

    const webpBuffer = await sharp(buffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp()
      .toBuffer();

    const base64 = webpBuffer.toString('base64');

    res.json({
      status: true,
      code: 200,
      creator,
      result: {
        webp_url: `data:image/webp;base64,${base64}`,
        base64: base64,
        size_kb: Math.round(webpBuffer.length / 1024)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "Sticker conversion failed: " + error.message
    });
  }
}
