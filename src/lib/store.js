/**
 * GitHub API Storage Helper
 * Stores all data in a single JSON file in a GitHub repository.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_PATH = process.env.GITHUB_PATH || 'db.json';

const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

let cache = null;
let sha = null;
let lastFetch = 0;

async function fetchDb() {
  // Simple cache for 5 seconds to reduce API calls
  if (cache && Date.now() - lastFetch < 5000) return cache;

  const res = await fetch(API_URL, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  if (res.status === 404) {
    // Initialize empty DB if not found
    cache = {};
    sha = null;
    return cache;
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub Fetch Error: ${err}`);
  }

  const data = await res.json();
  sha = data.sha;
  cache = JSON.parse(Buffer.from(data.content, 'base64').toString());
  lastFetch = Date.now();
  return cache;
}

async function saveDb(data) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Update database ${new Date().toISOString()}`,
      content,
      sha: sha // Required for updates
    })
  });

  if (!res.ok) {
    const err = await res.text();
    // If SHA mismatch, force refresh and retry once
    if (res.status === 409 || err.includes('does not match')) {
      cache = null;
      const freshData = await fetchDb();
      // Merge changes (this is naive but better than nothing)
      Object.assign(freshData, data);
      return saveDb(freshData);
    }
    throw new Error(`GitHub Save Error: ${err}`);
  }

  const result = await res.json();
  sha = result.content.sha;
  cache = data;
  lastFetch = Date.now();
}

export const store = {
  get: async (key) => {
    const db = await fetchDb();
    return db[key] || null;
  },
  set: async (key, value) => {
    const db = await fetchDb();
    db[key] = value;
    await saveDb(db);
    return true;
  },
  incr: async (key) => {
    const db = await fetchDb();
    db[key] = (db[key] || 0) + 1;
    await saveDb(db);
    return db[key];
  },
  exists: async (key) => {
    const db = await fetchDb();
    return key in db;
  }
};
