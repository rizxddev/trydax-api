import fetch from 'node-fetch';

export default async function handler(req, res) {
  const creator = "TryDax";
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator,
      message: "YouTube URL is required."
    });
  }

  try {
    // Placeholder for real YouTube DL logic
    res.json({
      status: true,
      code: 200,
      creator,
      result: {
        title: "YouTube Video Download",
        quality: "720p",
        url: url, // In real app, this would be the direct link
        thumbnail: "https://picsum.photos/seed/ytdl/400/225"
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
}
