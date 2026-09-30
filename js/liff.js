/*
 * LINE / LIFF連携専用。
 * 本番利用時は LIFF_ID をLINE Developersで発行された値へ置き換えてください。
 */
(() => {
  'use strict';

  const LIFF_ID = 'YOUR_LIFF_ID';
  const DEV_MODE = new URLSearchParams(location.search).get('dev') === '1';

  const status = {
    initialized: false,
    inClient: false,
    loggedIn: false,
    context: null,
    error: null,
  };

  async function initialize() {
    if (DEV_MODE) {
      status.initialized = true;
      return { ...status, devMode: true };
    }

    if (LIFF_ID === 'YOUR_LIFF_ID') {
      status.error = new Error('LIFF IDが未設定です。js/liff.js の LIFF_ID を設定してください。');
      return { ...status, devMode: false };
    }

    if (typeof liff === 'undefined') {
      status.error = new Error('LIFF SDKを読み込めませんでした。通信環境を確認してください。');
      return { ...status, devMode: false };
    }

    try {
      await liff.init({ liffId: LIFF_ID });
      status.initialized = true;
      status.inClient = liff.isInClient();
      status.loggedIn = liff.isLoggedIn();
      status.context = liff.getContext?.() ?? null;

      // 外部ブラウザではログイン自体は可能だが、同じトークへのsendMessagesはできない。
      // 本アプリの目的は同一トーク送信なので、自動ログインは行わずUI上で案内する。
      return { ...status, devMode: false };
    } catch (error) {
      status.error = error;
      return { ...status, devMode: false };
    }
  }

  function canSendToCurrentChat() {
    if (DEV_MODE) return true;
    if (!status.initialized || !status.inClient) return false;
    if (typeof liff === 'undefined') return false;
    return typeof liff.isApiAvailable === 'function'
      ? liff.isApiAvailable('sendMessages')
      : true;
  }

  async function sendToCurrentChat(message) {
    if (DEV_MODE) {
      console.info('[DEV_MODE] sendMessages:', message);
      return { devMode: true };
    }

    if (!canSendToCurrentChat()) {
      throw new Error('このトークへのメッセージ送信を利用できません。LINEトークからLIFF URLを開き、chat_message.write権限を許可してください。');
    }

    await liff.sendMessages([
      {
        type: 'text',
        text: message,
      },
    ]);

    return { devMode: false };
  }

  function close() {
    if (DEV_MODE) return;
    if (typeof liff !== 'undefined' && status.inClient) {
      liff.closeWindow();
    }
  }

  function getStatus() {
    return { ...status, devMode: DEV_MODE, liffIdConfigured: LIFF_ID !== 'YOUR_LIFF_ID' };
  }

  window.LineBridge = {
    initialize,
    sendToCurrentChat,
    canSendToCurrentChat,
    close,
    getStatus,
  };
})();
