import { store } from '../lib/store.js';

export default async function handler(req, res) {
  const creator = "TryDax";
  const apikey = req.query.apikey || req.headers['x-api-key'];

  if (!apikey) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator,
      message: "API Key is required for validation."
    });
  }

  try {
    const keyData = await store.get(`key:${apikey}`);
    const usage = await store.get(`usage:${apikey}`);

    if (!keyData) {
      return res.status(401).json({
        status: false,
        code: 401,
        creator,
        message: "Invalid API Key."
      });
    }

    res.json({
      status: true,
      code: 200,
      creator,
      result: {
        valid: true,
        usage: usage || 0,
        ...keyData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "Validation failed."
    });
  }
}
