import gTTS from 'gtts';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

export default async function handler(req, res) {
  const creator = "TryDax";
  const { text, lang = 'id' } = req.query;

  if (!text) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator,
      message: "Text parameter is required."
    });
  }

  try {
    const gtts = new gTTS(text, lang);
    const fileName = `tts-${Date.now()}.mp3`;
    const filePath = path.join(os.tmpdir(), fileName);
    
    const saveFile = promisify(gtts.save).bind(gtts);
    await saveFile(filePath);

    // In a real production app, you'd upload this to a CDN.
    // For this demo, we'll return the base64 or stream it.
    const audioBuffer = fs.readFileSync(filePath);
    const base64 = audioBuffer.toString('base64');
    
    // Clean up
    fs.unlinkSync(filePath);

    res.json({
      status: true,
      code: 200,
      creator,
      result: {
        text,
        lang,
        audio: `data:audio/mp3;base64,${base64}`
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "TTS generation failed: " + error.message
    });
  }
}
