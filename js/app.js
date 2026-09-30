(() => {
  'use strict';

  const app = document.getElementById('app');
  const toast = document.getElementById('toast');

  const state = {
    screen: 'start',
    selectedMain: null,
    selectedDetail: null,
    otherText: '',
    sending: false,
    lineStatus: null,
    validationMessage: '',
  };

  const choiceData = {
    main: [
      { id: 'home', label: 'お家でゆっくり', icon: '⌂' },
      { id: 'food', label: 'ご飯食べに', icon: '♨' },
      { id: 'outing', label: 'おでかけ', icon: '↻' },
    ],
    home: [
      { id: 'snack', label: 'お菓子パーティ', icon: '▥' },
      { id: 'movie', label: '映画鑑賞', icon: '≋' },
      { id: 'adult', label: '大人なこと？♡', icon: '⚿' },
      { id: 'other', label: 'その他（手入力）', icon: '♧', input: true },
    ],
    food: [
      { id: 'saizeriya', label: 'サイゼ', icon: '◷' },
      { id: 'sushi', label: 'お寿司', icon: '◷' },
      { id: 'ramen', label: 'ラーメン', icon: '◷' },
      { id: 'other', label: 'その他（手入力）', icon: '◷', input: true },
    ],
    outing: [
      { id: 'cafe', label: 'カフェでゆっくり', icon: '☕' },
      { id: 'zoo', label: '動物園', icon: '◉' },
      { id: 'department', label: 'デパートでお買い物', icon: '♟' },
      { id: 'hotel', label: 'ホテルで…♡', icon: '♧' },
    ],
  };

  const branchCopy = {
    home: {
      eyebrow: 'もう少し詳しく',
      question: '今日はどんなお家時間ですか？',
      help: '選択肢から選ぶか、自由に書いてください',
      placeholder: '例：お茶会・ゲーム会・家で過ごす',
    },
    food: {
      eyebrow: 'もう少し詳しく',
      question: 'どんなご飯食べに行く？',
      help: '選択肢から選ぶか、自由に書いてください',
      placeholder: '例：カレー・ハンバーグ・居酒屋',
    },
    outing: {
      eyebrow: '',
      question: '今日はどんなおでかけ？',
      help: '恋人同士で楽しめるおでかけを選んでね',
      placeholder: '',
    },
  };

  const svgCalendar = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5.5" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.8"/>
      <path d="M8.5 4v3M15.5 4v3M8 11.5l2.2 2.2L16 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const svgCheck = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 12.5l3.4 3.4L17.8 8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  function statusBar() {
    return `<div class="statusbar"><span>9:41</span><span class="status-icons">▮▮ ◉ ▰</span></div>`;
  }

  function header({ title, back = false }) {
    return `
      ${statusBar()}
      <div class="header">
        <div>${back ? '<button class="back-btn" type="button" data-action="back">‹&nbsp;&nbsp;戻る</button>' : ''}</div>
        <div class="header-title">${escapeHtml(title)}</div>
        <div></div>
      </div>`;
  }

  function progress(step) {
    const percent = step === 1 ? 33 : step === 2 ? 66 : 100;
    return `
      <div class="progress-wrap">
        <div class="progress-meta"><span>STEP ${step} / 3</span><span>${percent}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
      </div>`;
  }

  function environmentBanner() {
    const s = state.lineStatus;
    if (!s) return '';
    if (s.devMode) {
      return `<div class="env-banner">開発モードです。LINE送信の代わりにブラウザ上で送信結果を確認できます。</div>`;
    }
    if (s.error) {
      return `<div class="env-banner error">${escapeHtml(s.error.message || 'LIFFの初期化に失敗しました。')}</div>`;
    }
    if (!s.inClient) {
      return `<div class="env-banner">本番送信はLINEトーク内からLIFF URLを開いた場合のみ利用できます。</div>`;
    }
    return '';
  }

  function renderStart() {
    app.innerHTML = `
      <section class="screen">
        ${header({ title: 'なにする〜？' })}
        ${environmentBanner()}
        <div class="content start-content">
          <div class="hero-icon">${svgCalendar}</div>
          <h1 class="start-title">なにする〜？<br>今日のデート候補を決めよう</h1>
          <p class="start-sub">ちょっとだけお話しを聞いて、<br>もっと楽しいデートにしよう</p>
          <div class="info-card">
            <div class="info-row">
              <div class="info-icon">◷</div>
              <div><div class="info-title">25秒で候補を決める</div><div class="info-text">4問の質問で、ふたりの気分をチェック</div></div>
            </div>
            <div class="info-row">
              <div class="info-icon">♧</div>
              <div><div class="info-title">恋人同士で楽しめる</div><div class="info-text">気軽に使えるチェックとして、楽しいデートを</div></div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="footer-note">気軽に相性をチェックして、楽しいデートを</div>
          <button class="primary-btn" type="button" data-action="start">えらぶ！&nbsp;&nbsp;→</button>
        </div>
      </section>`;
  }

  function renderChoiceCards(items, selectedId) {
    return items.map(item => {
      const selected = item.id === selectedId;
      return `
        <button class="choice-card ${selected ? 'selected' : ''}" type="button" data-choice="${item.id}">
          <span class="choice-icon">${item.icon}</span>
          <span class="choice-label">${escapeHtml(item.label)}</span>
          <span class="radio">${selected ? '✓' : ''}</span>
        </button>`;
    }).join('');
  }

  function renderStep1() {
    app.innerHTML = `
      <section class="screen">
        ${header({ title: 'えらんでね！', back: true })}
        ${progress(1)}
        <div class="content">
          <p class="eyebrow">まずは</p>
          <h1 class="question">どのようなお問い合わせですか？</h1>
          <p class="question-help">もっとも近いものを1つ選んでください</p>
          <div class="choices">${renderChoiceCards(choiceData.main, state.selectedMain)}</div>
        </div>
        <div class="footer"><button class="primary-btn" type="button" data-action="next1" ${state.selectedMain ? '' : 'disabled'}>次へ&nbsp;&nbsp;→</button></div>
      </section>`;
  }

  function renderStep2() {
    const cfg = branchCopy[state.selectedMain];
    const items = choiceData[state.selectedMain];
    const mainLabel = choiceData.main.find(x => x.id === state.selectedMain)?.label || '';
    const otherSelected = state.selectedDetail === 'other';
    const canNext = state.selectedDetail && (!otherSelected || state.otherText.trim().length > 0);

    app.innerHTML = `
      <section class="screen">
        ${header({ title: '今日のデートを決めよう', back: true })}
        ${progress(2)}
        <div class="content">
          <div class="crumb"><span class="crumb-badge">◎</span><span>選択中&nbsp;&nbsp;${escapeHtml(mainLabel)}</span></div>
          ${cfg.eyebrow ? `<p class="eyebrow">${escapeHtml(cfg.eyebrow)}</p>` : ''}
          <h1 class="question">${escapeHtml(cfg.question)}</h1>
          <p class="question-help">${escapeHtml(cfg.help)}</p>
          <div class="choices">${renderChoiceCards(items, state.selectedDetail)}</div>
          ${otherSelected ? `
            <div class="other-box">
              <label class="other-label" for="otherText"><span>その他（手入力）</span><span class="other-count">${state.otherText.length}/50</span></label>
              <input id="otherText" class="other-input" maxlength="50" autocomplete="off" value="${escapeAttr(state.otherText)}" placeholder="${escapeAttr(cfg.placeholder)}" />
              ${state.validationMessage ? `<div class="validation">${escapeHtml(state.validationMessage)}</div>` : ''}
            </div>` : ''}
          ${state.selectedMain === 'outing' ? '<p class="question-help" style="text-align:center;margin-top:14px">♧&nbsp;&nbsp;恋人同士で楽しめるおでかけを選んでね</p>' : ''}
        </div>
        <div class="footer"><button class="primary-btn" type="button" data-action="next2" ${canNext ? '' : 'disabled'}>次へ&nbsp;&nbsp;→</button></div>
      </section>`;

    if (otherSelected) {
      const input = document.getElementById('otherText');
      input?.addEventListener('input', e => {
        state.otherText = e.target.value;
        state.validationMessage = '';
        renderStep2();
        requestAnimationFrame(() => {
          const restored = document.getElementById('otherText');
          restored?.focus();
          restored?.setSelectionRange(state.otherText.length, state.otherText.length);
        });
      });
    }
  }

  function getResultLabel() {
    if (state.selectedDetail === 'other') return state.otherText.trim();
    return choiceData[state.selectedMain]?.find(x => x.id === state.selectedDetail)?.label || '';
  }

  function renderResult() {
    const result = getResultLabel();
    const sendReady = !!result && !state.sending;
    app.innerHTML = `
      <section class="screen">
        ${header({ title: '送信完了', back: true })}
        ${progress(3)}
        ${environmentBanner()}
        <div class="content result-content">
          <div class="result-check">${svgCheck}</div>
          <h1 class="result-title">今日のデートは？</h1>
          <p class="result-sub">恋人同士のデート結果を<br>LINEトークに送るよ</p>
          <div class="result-card">
            <div class="result-label">今日のデート</div>
            <div class="result-value">${escapeHtml(result)}</div>
            <div class="result-note">恋人同士で楽しめる<br>決定済みのデート案を<br>LINEトークに送るよ</div>
          </div>
        </div>
        <div class="footer">
          <button class="primary-btn" type="button" data-action="send" ${sendReady ? '' : 'disabled'}>${state.sending ? '送信中...' : 'トークに送る&nbsp;&nbsp;◯'}</button>
        </div>
      </section>`;
  }

  function render() {
    if (state.screen === 'start') renderStart();
    if (state.screen === 'step1') renderStep1();
    if (state.screen === 'step2') renderStep2();
    if (state.screen === 'result') renderResult();
  }

  function showToast(message, ms = 1400) {
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), ms);
  }

  function selectMain(id) {
    if (state.selectedMain !== id) {
      state.selectedMain = id;
      state.selectedDetail = null;
      state.otherText = '';
      state.validationMessage = '';
    }
    renderStep1();
  }

  function selectDetail(id) {
    if (state.selectedDetail !== id) {
      state.selectedDetail = id;
      state.validationMessage = '';
      if (id !== 'other') state.otherText = '';
    }
    renderStep2();
  }

  function goBack() {
    if (state.screen === 'step1') state.screen = 'start';
    else if (state.screen === 'step2') state.screen = 'step1';
    else if (state.screen === 'result') state.screen = 'step2';
    render();
  }

  async function sendResult() {
    if (state.sending) return;
    const result = getResultLabel();
    if (!result) return;

    state.sending = true;
    renderResult();

    const message = `今日のデート決定！✨\n「${result}」`;

    try {
      const response = await window.LineBridge.sendToCurrentChat(message);
      showToast(response.devMode ? `DEV送信: ${result}` : '送信しました！', 900);
      window.setTimeout(() => window.LineBridge.close(), 800);
    } catch (error) {
      state.sending = false;
      renderResult();
      showToast(error?.message || 'LINEへの送信に失敗しました。', 2800);
    }
  }

  app.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]');
    if (choice) {
      if (state.screen === 'step1') selectMain(choice.dataset.choice);
      else if (state.screen === 'step2') selectDetail(choice.dataset.choice);
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    if (action === 'start') { state.screen = 'step1'; render(); }
    else if (action === 'back') goBack();
    else if (action === 'next1' && state.selectedMain) { state.screen = 'step2'; render(); }
    else if (action === 'next2') {
      if (!state.selectedDetail) return;
      if (state.selectedDetail === 'other' && !state.otherText.trim()) {
        state.validationMessage = '内容を入力してください。';
        renderStep2();
        return;
      }
      state.screen = 'result';
      render();
    }
    else if (action === 'send') sendResult();
  });

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttr(value = '') { return escapeHtml(value); }

  async function boot() {
    renderStart();
    state.lineStatus = await window.LineBridge.initialize();
    render();
  }

  boot();
})();
