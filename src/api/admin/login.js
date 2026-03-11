import { store } from '../../lib/store.js';

export default async function handler(req, res) {
  const creator = "TryDax";
  const { token } = req.body;

  if (token === process.env.ADMIN_TOKEN) {
    res.json({ status: true, message: "Login success" });
  } else {
    res.status(401).json({ status: false, message: "Invalid admin token" });
  }
}
