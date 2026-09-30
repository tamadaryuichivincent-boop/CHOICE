/*
 * LINE / LIFF連携専用。
 * LIFF ID: CHOICE
 */
(() => {
  'use strict';

  const LIFF_ID = '2011807631-rmaV4vrl';
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

    if (typeof liff === 'undefined') {
      status.error = new Error(
        'LIFF SDKを読み込めませんでした。通信環境を確認してください。'
      );
      return { ...status, devMode: false };
    }

    try {
      await liff.init({ liffId: LIFF_ID });

      status.initialized = true;
      status.inClient = liff.isInClient();
      status.loggedIn = liff.isLoggedIn();
      status.context =
        typeof liff.getContext === 'function' ? liff.getContext() : null;

      return { ...status, devMode: false };
    } catch (error) {
      status.error = error;
      return { ...status, devMode: false };
    }
  }

  /**
   * 現在のLINEトークへ送信できる最低条件を確認する。
   *
   * 注意:
   * liff.isApiAvailable('sendMessages') は使用しない。
   * sendMessages は isApiAvailable() の対象API名ではないため、
   * "Unexpected API name" の原因になる。
   */
  function canSendToCurrentChat() {
    if (DEV_MODE) {
      return true;
    }

    if (!status.initialized || !status.inClient) {
      return false;
    }

    if (typeof liff === 'undefined') {
      return false;
    }

    return typeof liff.sendMessages === 'function';
  }

  async function sendToCurrentChat(message) {
    if (DEV_MODE) {
      console.info('[DEV_MODE] sendMessages:', message);
      return { devMode: true };
    }

    if (!status.initialized) {
      throw new Error(
        'LIFFの初期化が完了していません。画面を開き直してください。'
      );
    }

    if (!status.inClient) {
      throw new Error(
        'LINEトークからLIFF URLを開いてください。通常のブラウザからは同じトークへ送信できません。'
      );
    }

    if (typeof liff === 'undefined' || typeof liff.sendMessages !== 'function') {
      throw new Error(
        'LINEへの送信機能を利用できません。LIFFアプリの設定を確認してください。'
      );
    }

    try {
      await liff.sendMessages([
        {
          type: 'text',
          text: message,
        },
      ]);

      return { devMode: false };
    } catch (error) {
      console.error('liff.sendMessages failed:', error);
      throw error;
    }
  }

  function close() {
    if (DEV_MODE) {
      return;
    }

    if (
      typeof liff !== 'undefined' &&
      status.inClient &&
      typeof liff.closeWindow === 'function'
    ) {
      liff.closeWindow();
    }
  }

  function getStatus() {
    return {
      ...status,
      devMode: DEV_MODE,
      liffIdConfigured: LIFF_ID !== 'YOUR_LIFF_ID',
    };
  }

  window.LineBridge = {
    initialize,
    sendToCurrentChat,
    canSendToCurrentChat,
    close,
    getStatus,
  };
})();
