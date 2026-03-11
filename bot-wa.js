import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import fetch from "node-fetch";

const API_BASE = "https://api.trydax.xyz"; // Change to your domain

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_session");
    const { version } = await fetchLatestBaileysVersion();

    // 1. Auto-fetch API Key by IP
    let apiKey = "";
    try {
        const res = await fetch(`${API_BASE}/api/key`);
        const data = await res.json();
        apiKey = data.result.apikey;
        console.log(`[SYSTEM] API Key retrieved: ${apiKey}`);
    } catch (e) {
        console.error("[ERROR] Failed to fetch API Key from TryDax.");
    }

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed, reconnecting...", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("TryDax WhatsApp Bot is Online!");
        }
    });

    sock.ev.on("messages.upsert", async (chat) => {
        const m = chat.messages[0];
        if (!m.message || m.key.fromMe) return;

        const from = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const prefix = ".";

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const q = args.join(" ");

        const reply = async (txt) => {
            await sock.sendMessage(from, { text: `┌─── 🤖 TryDax Bot ───\n│ ${txt}\n└─────────────────────` });
        };

        switch (command) {
            case "menu":
            case "help":
                reply(`Available Commands:
- .ai <teks>
- .tts <teks>
- .dl <url>
- .sticker (reply image)
- .ocr (reply image)
- .ping
- .info`);
                break;

            case "ping":
                reply("Pong! 🏓");
                break;

            case "ai":
                if (!q) return reply("Format: .ai <teks>");
                const aiRes = await fetch(`${API_BASE}/tools/ai?apikey=${apiKey}&text=${encodeURIComponent(q)}`);
                const aiJson = await aiRes.json();
                reply(aiJson.result?.answer || aiJson.message);
                break;

            case "tts":
                if (!q) return reply("Format: .tts <teks>");
                const ttsRes = await fetch(`${API_BASE}/tools/tts?apikey=${apiKey}&text=${encodeURIComponent(q)}`);
                const ttsJson = await ttsRes.json();
                if (ttsJson.status) {
                    await sock.sendMessage(from, { audio: { url: ttsJson.result.audio }, mimetype: "audio/mp4", ptt: true });
                } else reply(ttsJson.message);
                break;

            case "dl":
                if (!q) return reply("Format: .dl <url>");
                const dlRes = await fetch(`${API_BASE}/tools/dl?apikey=${apiKey}&url=${q}`);
                const dlJson = await dlRes.json();
                if (dlJson.status) {
                    reply(`📥 Result: ${dlJson.result.title}\nLink: ${dlJson.result.downloads[0].url}`);
                } else reply(dlJson.message);
                break;

            case "info":
                reply(`Bot Info:
- API Key: ${apiKey}
- Base: ${API_BASE}
- Status: Active`);
                break;
        }
    });
}

startBot();
