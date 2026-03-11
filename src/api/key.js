import { store } from '../lib/store.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  const creator = "TryDax";
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;

  try {
    // Check if IP already has a key
    let apikey = await store.get(`ip:${ip}`);

    if (!apikey) {
      // Generate new key: 4 segments of 6 characters
      const generateSegment = () => crypto.randomBytes(3).toString('hex').toUpperCase();
      apikey = `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;

      // Save to KV
      await store.set(`ip:${ip}`, apikey);
      await store.set(`key:${apikey}`, {
        ip,
        created_at: new Date().toISOString()
      });
      await store.set(`usage:${apikey}`, 0);
    }

    res.json({
      status: true,
      code: 200,
      creator,
      result: {
        apikey,
        ip,
        info: "Keep this key safe. 1 IP = 1 Key."
      }
    });
  } catch (error) {
    console.error('Key Gen Error:', error);
    res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "Failed to generate or retrieve API Key."
    });
  }
}
