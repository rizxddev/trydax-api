import { store } from './store.js';

export async function requireAuth(req, res, next) {
  const apikey = req.query.apikey || req.headers['x-api-key'];
  const creator = "TryDax";

  if (!apikey) {
    return res.status(401).json({
      status: false,
      code: 401,
      creator,
      message: "API Key is required. Get yours at /api/key"
    });
  }

  try {
    const keyData = await store.get(`key:${apikey}`);
    if (!keyData) {
      return res.status(401).json({
        status: false,
        code: 401,
        creator,
        message: "Invalid API Key."
      });
    }

    // Rate Limiting: 200 requests per hour
    const now = new Date();
    const hourKey = `rate:${apikey}:${now.toISOString().substring(0, 13)}`; // YYYY-MM-DDTHH
    const currentUsage = await store.incr(hourKey);
    
    if (currentUsage === 1) {
      // Set TTL for the first increment
      await store.set(hourKey, 1, 3600);
    }

    const limit = 200;
    const remaining = Math.max(0, limit - currentUsage);
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(now.getTime() + 3600000).toISOString());

    if (currentUsage > limit) {
      return res.status(429).json({
        status: false,
        code: 429,
        creator,
        message: `Rate limit exceeded. Reset in ${Math.ceil((3600000 - (now.getTime() % 3600000)) / 60000)} minutes.`,
        limit,
        remaining: 0,
        reset_at: new Date(now.getTime() + (3600000 - (now.getTime() % 3600000))).toISOString()
      });
    }

    // Increment total usage
    await store.incr(`usage:${apikey}`);

    req.apikey = apikey;
    req.keyData = keyData;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({
      status: false,
      code: 500,
      creator,
      message: "Internal Server Error during authentication."
    });
  }
}
