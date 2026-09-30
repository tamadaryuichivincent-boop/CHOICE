# なにする〜？ LIFFアプリ

LINEトークからLIFFアプリを開き、2段階の選択後、結果を同じトークへ送るVanilla JavaScript製Webアプリです。

## ファイル

- `index.html`
- `css/style.css`
- `js/app.js`
- `js/liff.js`

## 1. ブラウザでUI確認

静的サーバーを起動します。

```bash
cd date-choice-liff
python -m http.server 8080
```

ブラウザで以下を開きます。

```text
http://localhost:8080/?dev=1
```

`?dev=1` ではLIFF初期化とLINE送信をモックし、送信結果をブラウザで確認できます。

## 2. 本番LIFF ID設定

`js/liff.js` の以下を置き換えます。

```js
const LIFF_ID = 'YOUR_LIFF_ID';
```

例：

```js
const LIFF_ID = '1234567890-AbcdEfgh';
```

## 3. HTTPSへ配置

LIFFのEndpoint URLはHTTPS必須です。GitHub Pages / Cloudflare Pages / Netlify / Vercel等の静的ホスティングに、このフォルダの内容をそのまま配置できます。

例：

```text
https://example.pages.dev/
```

このURLをLIFFアプリのEndpoint URLへ設定します。

## 4. LINE Developers側の必須設定

同じトークへの送信に `liff.sendMessages()` を使うため、LIFFアプリのScopeに必ず以下を付与してください。

- `chat_message.write`（必須：sendMessages用）
- `openid`（必要に応じて）
- `profile`（プロフィールを使う場合のみ）

このアプリ自体はユーザープロフィールを取得しないので、送信だけなら実装上重要なのは `chat_message.write` です。

## 5. 実機テスト

1. HTTPSへデプロイ
2. LINE DevelopersでEndpoint URLとLIFF IDを設定
3. Scopeに `chat_message.write` を付与
4. `js/liff.js` にLIFF IDを設定して再デプロイ
5. LINEトーク内から `https://liff.line.me/{LIFF_ID}` を開く
6. 選択して「トークに送る」を押す
7. 元のトークに結果が投稿されれば成功

## 注意

`liff.sendMessages()` は、LINEアプリ内で、1対1・グループ・複数人トーク等のトークからLIFFを起動した場合に、その起動元トークへ送信するためのAPIです。外部ブラウザから同じトークへ送る用途には使えません。

また、最近使ったサービス等から再起動した場合など、起動経路によって `sendMessages()` が利用できないケースがあります。必ず実際の対象トークからLIFF URLを開いて試してください。
