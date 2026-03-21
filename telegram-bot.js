require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { execSync } = require("child_process");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const PROJECT_DIR = path.resolve(__dirname);

if (!BOT_TOKEN || !CHAT_ID) {
  console.error("Hata: .env dosyasında BOT_TOKEN ve CHAT_ID tanımlanmalı.");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("Bot başlatıldı, mesaj bekleniyor...");

bot.on("message", async (msg) => {
  if (String(msg.chat.id) !== String(CHAT_ID)) return;
  const userMessage = msg.text;
  if (!userMessage) return;

  await bot.sendMessage(CHAT_ID, "⏳ Komut alındı, Claude çalışıyor...");

  try {
    // Claude Code'u non-interactive modda çalıştır
    const claudeOutput = execSync(`claude -p ${JSON.stringify(userMessage)}`, {
      cwd: PROJECT_DIR,
      timeout: 300_000,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });

    // Git commit ve push
    let gitResult = "";
    try {
      const commitMsg = `telegram: ${userMessage.slice(0, 72)}`;
      gitResult = execSync(
        `git add -A && git commit -m ${JSON.stringify(commitMsg)} && git push`,
        { cwd: PROJECT_DIR, encoding: "utf8" }
      );
      gitResult = "✅ Commit ve push başarılı.";
    } catch (gitErr) {
      const msg = gitErr.stderr || gitErr.message || "";
      gitResult = msg.includes("nothing to commit")
        ? "ℹ️ Değişiklik yok, commit yapılmadı."
        : `⚠️ Git hatası: ${msg.slice(0, 300)}`;
    }

    const preview = claudeOutput.slice(0, 3200);
    await bot.sendMessage(
      CHAT_ID,
      `✅ Tamamlandı!\n\n${preview}\n\n${gitResult}`.slice(0, 4096)
    );
  } catch (err) {
    const errText = (err.stderr || err.message || String(err)).slice(0, 3500);
    await bot.sendMessage(CHAT_ID, `❌ Hata oluştu:\n${errText}`);
  }
});

bot.on("polling_error", (err) => console.error("Polling hatası:", err.message));
