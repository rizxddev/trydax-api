import { store } from '../lib/store.js';

export default async function handler(req, res) {
  try {
    let tools = await store.get('system:tools');
    if (!tools) {
      tools = [
        { id: 'ai', name: "AI Chat Assistant", desc: "Gemini 3 Flash powered AI chat.", endpoint: "/tools/ai?apikey={key}&text=Halo", icon: "🤖" },
        { id: 'tts', name: "Text to Speech", desc: "Convert text to Indonesian/English audio.", endpoint: "/tools/tts?apikey={key}&text=Halo&lang=id", icon: "🔊" },
        { id: 'ytdl', name: "YouTube Video Downloader", desc: "Download high quality YouTube videos.", endpoint: "/tools/ytdl?apikey={key}&url=https://youtube.com/...", icon: "📹" },
        { id: 'ytmp3', name: "YouTube MP3 Downloader", desc: "Extract audio from YouTube videos.", endpoint: "/tools/ytmp3?apikey={key}&url=https://youtube.com/...", icon: "🎵" },
        { id: 'sticker', name: "Sticker Maker", desc: "Convert images to WhatsApp WebP stickers.", endpoint: "/tools/sticker?apikey={key}&url=https://...", icon: "🖼️" },
        { id: 'ocr', name: "OCR Reader", desc: "Extract text from images automatically.", endpoint: "/tools/ocr?apikey={key}&url=https://...", icon: "🔍" }
      ];
    }
    res.json({ status: true, result: tools });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
}
