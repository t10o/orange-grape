/**
 * AdSense OAuth2 リフレッシュトークン取得スクリプト
 *
 * 使い方:
 *   1. .env に GOOGLE_ADSENSE_CLIENT_ID と GOOGLE_ADSENSE_CLIENT_SECRET を設定
 *   2. node scripts/get-adsense-token.mjs を実行
 *   3. 表示されたURLをブラウザで開き、Googleアカウントでログイン
 *   4. リダイレクト先URLの ?code= パラメータをコピーしてターミナルに貼り付け
 *   5. 表示されたリフレッシュトークンを .env の GOOGLE_ADSENSE_REFRESH_TOKEN に設定
 */

import { createInterface } from "node:readline";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_ADSENSE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADSENSE_CLIENT_SECRET;
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Error: GOOGLE_ADSENSE_CLIENT_ID と GOOGLE_ADSENSE_CLIENT_SECRET を .env に設定してください");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/adsense.readonly"],
  prompt: "consent",
});

console.log("\n以下のURLをブラウザで開いてGoogleアカウントにログインしてください:\n");
console.log(authUrl);
console.log("\nログイン後に表示された認証コードを貼り付けてください:");

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question("> ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log("\n✓ トークン取得成功！\n");
    console.log(".env に以下を追加してください:\n");
    console.log(`GOOGLE_ADSENSE_REFRESH_TOKEN=${tokens.refresh_token}`);
  } catch (err) {
    console.error("エラー:", err.message);
  }
});
