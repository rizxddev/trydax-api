import { store } from '../../lib/store.js';

export default async function handler(req, res) {
  const creator = "TryDax";
  const token = req.headers['x-admin-token'];

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }

  if (req.method === 'GET') {
    try {
      // Get all tools metadata
      let tools = await store.get('system:tools');
      if (!tools) {
        // Default tools if none in KV
        tools = [
          { id: 'ai', name: "AI Chat Assistant", desc: "Gemini 3 Flash powered AI chat.", endpoint: "/tools/ai?apikey={key}&text=Halo", icon: "🤖" },
          { id: 'tts', name: "Text to Speech", desc: "Convert text to Indonesian/English audio.", endpoint: "/tools/tts?apikey={key}&text=Halo&lang=id", icon: "🔊" },
          { id: 'ytdl', name: "YouTube Video Downloader", desc: "Download high quality YouTube videos.", endpoint: "/tools/ytdl?apikey={key}&url=https://youtube.com/...", icon: "📹" },
          { id: 'ytmp3', name: "YouTube MP3 Downloader", desc: "Extract audio from YouTube videos.", endpoint: "/tools/ytmp3?apikey={key}&url=https://youtube.com/...", icon: "🎵" },
          { id: 'sticker', name: "Sticker Maker", desc: "Convert images to WhatsApp WebP stickers.", endpoint: "/tools/sticker?apikey={key}&url=https://...", icon: "🖼️" },
          { id: 'ocr', name: "OCR Reader", desc: "Extract text from images automatically.", endpoint: "/tools/ocr?apikey={key}&url=https://...", icon: "🔍" }
        ];
        await store.set('system:tools', tools);
      }
      res.json({ status: true, result: tools });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { tools } = req.body;
      await store.set('system:tools', tools);
      res.json({ status: true, message: "Tools updated successfully" });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
    }
  }
}
