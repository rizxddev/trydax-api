import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Import Handlers
import keyHandler from "./src/api/key.js";
import validateHandler from "./src/api/validate.js";
import toolsListHandler from "./src/api/tools-list.js";
import adminLoginHandler from "./src/api/admin/login.js";
import adminToolsHandler from "./src/api/admin/tools.js";
import aiHandler from "./src/api/tools/ai/index.js";
import ttsHandler from "./src/api/tools/tts/index.js";
import ytdlHandler from "./src/api/tools/ytdl/index.js";
import ytmp3Handler from "./src/api/tools/ytmp3/index.js";
import stickerHandler from "./src/api/tools/sticker/index.js";
import ocrHandler from "./src/api/tools/ocr/index.js";

// Middleware
import { requireAuth } from "./src/lib/auth.js";

// API Routes
app.get("/api/key", keyHandler);
app.get("/api/validate", validateHandler);
app.get("/api/tools", toolsListHandler);
app.post("/api/admin/login", adminLoginHandler);
app.get("/api/admin/tools", adminToolsHandler);
app.post("/api/admin/tools", adminToolsHandler);

// Tool Routes (with Auth)
app.get("/tools/ai", requireAuth, aiHandler);
app.get("/tools/tts", requireAuth, ttsHandler);
app.get("/tools/ytdl", requireAuth, ytdlHandler);
app.get("/tools/ytmp3", requireAuth, ytmp3Handler);
app.get("/tools/sticker", requireAuth, stickerHandler);
app.get("/tools/ocr", requireAuth, ocrHandler);

// Fallback to index.html for SPA behavior if needed, 
// though here we serve static files from public/
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TryDax API running on http://localhost:${PORT}`);
});
