import { Bot, InputFile } from "grammy";
import fetch from "node-fetch";

const API_BASE = "https://api.trydax.xyz"; // Change to your domain
const bot = new Bot("YOUR_TELEGRAM_BOT_TOKEN");

let apiKey = "";

async function getApiKey() {
    try {
        const res = await fetch(`${API_BASE}/api/key`);
        const data = await res.json();
        apiKey = data.result.apikey;
        console.log(`[SYSTEM] API Key retrieved: ${apiKey}`);
    } catch (e) {
        console.error("[ERROR] Failed to fetch API Key.");
    }
}

bot.command("start", (ctx) => {
    ctx.reply(`<b>Selamat datang di TryDax Bot!</b>\n\nGunakan /help untuk melihat daftar perintah.`, { parse_mode: "HTML" });
});

bot.command("help", (ctx) => {
    ctx.reply(`<b>Daftar Perintah:</b>\n
<code>/ai &lt;teks&gt;</code> - Tanya AI
<code>/tts &lt;teks&gt;</code> - Text to Speech
<code>/dl &lt;url&gt;</code> - Downloader
<code>/ping</code> - Cek status bot
<code>/mykey</code> - Cek API Key`, { parse_mode: "HTML" });
});

bot.command("ai", async (ctx) => {
    const text = ctx.match;
    if (!text) return ctx.reply("Format: /ai <teks>");
    
    await ctx.replyWithChatAction("typing");
    const res = await fetch(`${API_BASE}/tools/ai?apikey=${apiKey}&text=${encodeURIComponent(text)}`);
    const json = await res.json();
    
    ctx.reply(`<pre>${json.result?.answer || json.message}</pre>`, { parse_mode: "HTML" });
});

bot.command("tts", async (ctx) => {
    const text = ctx.match;
    if (!text) return ctx.reply("Format: /tts <teks>");
    
    const res = await fetch(`${API_BASE}/tools/tts?apikey=${apiKey}&text=${encodeURIComponent(text)}`);
    const json = await res.json();
    
    if (json.status) {
        // Since it's a data URL, we might need to handle it or use a direct link if available
        await ctx.replyWithAudio(json.result.audio);
    } else {
        ctx.reply(json.message);
    }
});

bot.command("mykey", (ctx) => {
    ctx.reply(`API Key Anda: <code>${apiKey}</code>`, { parse_mode: "HTML" });
});

bot.command("ping", (ctx) => ctx.reply("Pong! 🏓"));

getApiKey().then(() => {
    bot.start();
    console.log("Telegram Bot is running...");
});
