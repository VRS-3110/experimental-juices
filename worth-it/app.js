/* Worth It? — page logic. The maths lives in calc.js. */
(function () {
  'use strict';
  const C = window.WorthCalc;
  const STORE_KEY = 'worth-it:v1';
  const TARGET_MIN = 20; // minutes of your work per use that still counts as "worth it"

  const PRESETS = [
    { id: 'fd', name: 'Fixed deposit', short: 'a fixed deposit', note: 'Example rate. Check what your bank offers today.' },
    { id: 'tbill', name: 'Treasury bills', short: 'treasury bills', note: 'Example rate. Check the latest CBSL auction results.' },
    { id: 'unit', name: 'Money market unit trust', short: 'a money market unit trust', note: 'Example rate. Unit trust returns are not guaranteed.' },
    { id: 'cse', name: 'Shares on the CSE', short: 'shares on the CSE', note: 'A long-run guess. Shares can fall as well as rise.' },
  ];

  const DEFAULTS = {
    settings: {
      salary: 120000, hoursPerWeek: 45, investId: 'fd',
      rates: { fd: 8, tbill: 8, unit: 9, cse: 12 },
      inflation: 5, usdRate: 300, lakhs: false,
    },
    buy: {
      name: '', kind: 'once', price: 150000, usd: false, usdPrice: 500,
      uses: 1, per: 'day', years: 3, resale: 40000,
      cost: 500, times: 5, timesPer: 'week', horizon: 10,
    },
    emi: { cash: 250000, monthly: 23500, months: 12, down: 0, fee: 0, feeUnit: 'rs' },
    wishlist: [],
  };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const num = (v, fallback = 0) => (typeof v === 'number' && isFinite(v) ? v : fallback);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- state ---------- */
  function load() {
    const s = clone(DEFAULTS);
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        for (const k of ['settings', 'buy', 'emi']) {
          if (saved[k] && typeof saved[k] === 'object') Object.assign(s[k], saved[k]);
        }
        s.settings.rates = Object.assign({}, DEFAULTS.settings.rates, (saved.settings || {}).rates);
        if (Array.isArray(saved.wishlist)) s.wishlist = saved.wishlist;
      }
    } catch (e) { /* private mode or bad data: start fresh */ }
    return s;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }
  let state = load();

  const getPath = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), state);
  function setPath(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((o, k) => o[k], state)[last] = value;
  }

  /* ---------- formatting ---------- */
  const rs = (n) => C.formatRs(n, { lakhs: state.settings.lakhs });
  const trim1 = (x) => String(Number(x.toFixed(1)));
  const pct = (x) => (x == null || !isFinite(x) ? '—' : trim1(x * 100) + '%');
  const count = (n) => Math.round(n).toLocaleString('en-US');
  const plural = (n, one, many) => (Math.round(n * 10) / 10 === 1 ? one : many);

  function hoursText(h) {
    if (!isFinite(h)) return '—';
    if (h < 1) return Math.max(1, Math.round(h * 60)) + ' min';
    if (h < 10) return trim1(h) + plural(h, ' hour', ' hours');
    return count(h) + ' hours';
  }
  function minutesText(m) {
    if (m < 1) return 'less than a minute';
    if (m < 60) return Math.round(m) + plural(Math.round(m), ' minute', ' minutes');
    return trim1(m / 60) + plural(m / 60, ' hour', ' hours');
  }
  function workSpan(h) {
    const week = num(state.settings.hoursPerWeek, 45);
    const days = h / (week / 5);
    if (days < 1) return 'less than a working day';
    if (days <= 20) return 'about ' + trim1(days) + plural(days, ' working day', ' working days');
    const weeks = h / week;
    if (weeks < 52) return 'about ' + trim1(weeks) + ' working weeks';
    const months = h / (week * 52 / 12);
    return 'about ' + trim1(months) + ' months of work';
  }

  const preset = () => PRESETS.find((p) => p.id === state.settings.investId) || PRESETS[0];
  const investRate = () => num(state.settings.rates[preset().id]) / 100;
  const inflation = () => num(state.settings.inflation) / 100;
  const hourly = () => C.hourlyRate(state.settings.salary, state.settings.hoursPerWeek);

  /* ---------- inputs ---------- */
  function readInput(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'radio') return el.value;
    if (el.dataset.type === 'range') return Number(el.value);
    if (el.dataset.type === 'money') {
      const n = C.parseAmount(el.value);
      return isFinite(n) ? n : null;
    }
    return el.value;
  }
  function writeInput(el, v) {
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'radio') el.checked = el.value === v;
    else if (el.dataset.type === 'money') el.value = C.formatPlain(v);
    else el.value = v == null ? '' : String(v);
  }
  function syncInputs() {
    for (const el of $$('[data-bind]')) {
      if (el === document.activeElement && el.dataset.type === 'money') continue;
      writeInput(el, getPath(el.dataset.bind));
    }
  }

  function onInput(e) {
    const el = e.target.closest('[data-bind]');
    if (!el) return;
    if (el.type === 'radio' && !el.checked) return;
    const v = readInput(el);
    if (el.dataset.type === 'money') {
      const bad = el.value.trim() !== '' && v == null;
      el.toggleAttribute('aria-invalid', bad);
    }
    setPath(el.dataset.bind, v);
    for (const twin of $$(`[data-bind="${el.dataset.bind}"]`)) {
      if (twin !== el && twin.type !== 'radio') writeInput(twin, v);
    }
    save();
    render();
  }
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);
  document.addEventListener('focusout', (e) => {
    const el = e.target.closest('[data-type="money"]');
    if (el && !el.hasAttribute('aria-invalid')) writeInput(el, getPath(el.dataset.bind));
    if (el) render();
  });

  /* ---------- chart ---------- */
  function niceTicks(max, n) {
    if (!(max > 0)) max = 1;
    const raw = max / n;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
    const ticks = [];
    for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(Number(v.toPrecision(12)));
    return ticks;
  }
  function compact(v) {
    if (v === 0) return '0';
    if (v >= 1e6) return trim1(v / 1e6) + 'M';
    if (state.settings.lakhs && v >= 1e5) return trim1(v / 1e5) + 'L';
    if (v >= 1e3) return trim1(v / 1e3) + 'k';
    return trim1(v);
  }

  function drawChart(svg, cfg) {
    const W = Math.max(280, Math.round(svg.getBoundingClientRect().width || 640));
    const H = W < 480 ? 230 : 280;
    const m = { l: 48, r: 16, t: 18, b: 42 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const xt = niceTicks(cfg.xMax, W < 480 ? 4 : 6);
    const yt = niceTicks(cfg.yMax, 4);
    const xTop = xt[xt.length - 1], yTop = yt[yt.length - 1];
    const sx = (x) => m.l + (x / xTop) * pw;
    const sy = (y) => m.t + ph - (Math.min(Math.max(y, 0), yTop) / yTop) * ph;
    const f = (n) => n.toFixed(1);
    let out = '';
    for (const v of yt) {
      out += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${f(sy(v))}" y2="${f(sy(v))}"/>`;
      out += `<text class="tick" x="${m.l - 8}" y="${f(sy(v))}" text-anchor="end" dy="0.35em">${compact(v)}</text>`;
    }
    for (const v of xt) out += `<text class="tick" x="${f(sx(v))}" y="${H - m.b + 18}" text-anchor="middle">${cfg.xFmt(v)}</text>`;
    out += `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${m.t + ph}" y2="${m.t + ph}"/>`;
    out += `<text class="axis-title" x="${m.l + pw / 2}" y="${H - 4}" text-anchor="middle">${cfg.xLabel}</text>`;
    if (cfg.hline && cfg.hline.y <= yTop) {
      const y = f(sy(cfg.hline.y));
      out += `<line class="target" x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}"/>`;
      out += `<text class="target-label" x="${W - m.r}" y="${y - 6}" text-anchor="end">${esc(cfg.hline.label)}</text>`;
    }
    for (const s of cfg.series) {
      let pts = s.points;
      if (s.fn) { // sample a curve from where it enters the plot to the right edge
        const x0 = s.x0(yTop);
        pts = [];
        for (let k = 0; k <= 120; k++) { const x = x0 * Math.pow(xTop / x0, k / 120); pts.push([x, s.fn(x)]); }
      }
      const d = pts.map((p, i) => (i ? 'L' : 'M') + f(sx(p[0])) + ' ' + f(sy(p[1]))).join('');
      out += `<path class="line ${s.cls}" d="${d}"/>`;
    }
    for (const mk of cfg.markers || []) {
      const x = sx(mk.x), y = sy(mk.y);
      const right = x > m.l + pw * 0.6;
      out += `<circle class="marker" cx="${f(x)}" cy="${f(y)}" r="5"/>`;
      out += `<text class="marker-label" x="${f(x + (right ? -10 : 10))}" y="${f(Math.max(y - 10, m.t + 10))}" text-anchor="${right ? 'end' : 'start'}">${esc(mk.label)}</text>`;
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('aria-label', cfg.alt);
    svg.innerHTML = out;
  }

  /* ---------- shared pieces ---------- */
  const lens = (label, value, sub) =>
    `<div class="lens card"><div class="lens-label">${label}</div><div class="lens-value">${value}</div><div class="lens-sub">${sub}</div></div>`;

  function setVerdict(el, v, text) {
    el.className = 'verdict card lvl-' + v.level;
    el.innerHTML = `<div class="verdict-emoji" aria-hidden="true">${v.emoji}</div><div><h2>${esc(v.title)}</h2><p>${text}</p></div>`;
  }

  /* ---------- Should I buy? ---------- */
  function computeBuy(b) {
    const s = state.settings;
    const hr = hourly();
    if (!(hr > 0)) return { error: 'Add your monthly salary and hours in <a href="#settings">Settings</a> to see the numbers.' };
    if (b.kind === 'habit') {
      const cost = num(b.cost), times = num(b.times);
      if (!(cost > 0) || !(times > 0)) return { error: 'Enter what it costs and how often you buy it.' };
      const r = C.habit({ cost, times, per: b.timesPer, hourly: hr, salary: num(s.salary) });
      return { kind: 'habit', r, v: C.verdictHabit(r.shareOfSalary), price: cost };
    }
    const price = b.usd ? num(b.usdPrice) * num(s.usdRate) : num(b.price);
    if (!(price > 0)) return { error: 'Enter a price to see the numbers.' };
    const r = C.oneOff({
      price, resale: num(b.resale), uses: num(b.uses), per: b.per, years: num(b.years),
      hourly: hr, targetMinutes: TARGET_MIN,
    });
    return { kind: 'once', r, v: C.verdictOnce(r.minutesPerUse, r.net), price };
  }

  function renderBuy() {
    const b = state.buy;
    $('#once-fields').hidden = b.kind !== 'once';
    $('#habit-fields').hidden = b.kind !== 'habit';
    $('#usd-fields').hidden = !b.usd;
    $('#rs-price-field').hidden = !!b.usd;
    const years = num(b.horizon, 10);
    $('#horizon-out').textContent = years + plural(years, ' year', ' years');
    $('#inv-hint').innerHTML = `Compared with ${preset().short} at <b>${pct(investRate())}</b> a year. <a href="#settings">Change</a>`;

    const res = computeBuy(b);
    const verdict = $('#buy-verdict'), lenses = $('#buy-lenses'), notes = $('#buy-notes');
    if (res.error) {
      verdict.className = 'verdict card lvl-none';
      verdict.innerHTML = `<div class="verdict-emoji" aria-hidden="true">🛒</div><div><h2>Should I buy it?</h2><p>${res.error}</p></div>`;
      lenses.innerHTML = notes.innerHTML = '';
      $('#buy-chart-fig').hidden = true;
      return;
    }
    $('#buy-chart-fig').hidden = false;
    if (res.kind === 'once') renderOnce(res, years); else renderHabit(res, years);
  }

  function renderOnce({ r, v }, horizon) {
    const b = state.buy, s = state.settings, hr = hourly();
    const rate = investRate(), inf = inflation();
    let text;
    if (r.net <= 0) text = "You expect to sell it for at least what you paid, so using it costs you next to nothing.";
    else if (r.minutesPerUse == null) text = `If you never use it, all ${rs(r.net)} is the cost.`;
    else text = `Each use costs about <b>${minutesText(r.minutesPerUse)}</b> of your work.`;
    setVerdict($('#buy-verdict'), v, text);

    const fv = C.futureValue(r.price, rate, horizon);
    const yrs = num(b.years);
    const resale = num(b.resale);
    $('#buy-lenses').innerHTML =
      lens('Cost per use',
        r.net <= 0 ? rs(0) : r.costPerUse == null ? '—' : rs(r.costPerUse),
        `${count(r.totalUses)} ${plural(r.totalUses, 'use', 'uses')} over ${trim1(yrs)} ${plural(yrs, 'year', 'years')}` +
          (resale > 0 ? `, after selling it for ${rs(resale)}` : '')) +
      lens('Hours of your work', hoursText(r.hoursOfWork), `${workSpan(r.hoursOfWork)}, at about ${rs(hr)} an hour`) +
      lens('If you invested it', rs(fv),
        `after ${horizon} ${plural(horizon, 'year', 'years')} in ${preset().short}. About ${rs(C.inTodaysMoney(fv, inf, horizon))} in today's money.`);

    const notes = [];
    if (r.net > 0 && r.usesForTarget > 0) {
      let line = `Use it at least <b>${count(r.usesForTarget)} times</b> to bring each use under ${TARGET_MIN} minutes of your work (${rs(r.targetCost)}).`;
      if (r.totalUses >= r.usesForTarget) line += ' Your plan gets there.';
      else line += ` Your plan is ${count(r.usesForTarget - r.totalUses)} uses short.`;
      notes.push(line);
    }
    if (b.usd) {
      notes.push(`At Rs. ${C.formatPlain(num(s.usdRate))} per dollar this costs ${rs(r.price)}. If the rupee weakens by 10%, the same thing costs ${rs(r.price * 1.1)}.`);
    }
    $('#buy-notes').innerHTML = notes.map((n) => `<li>${n}</li>`).join('');

    const svg = $('#buy-chart');
    if (r.net <= 0 || r.totalUses <= 0) {
      $('#buy-chart-fig').hidden = true;
      return;
    }
    const xMax = Math.max(r.totalUses * 1.6, r.usesForTarget * 1.25, 10);
    const yMax = Math.max(r.costPerUse * 2.2, r.targetCost * 2.5);
    $('#buy-chart-cap').innerHTML = '<b>Cost per use</b> (Rs.) falls the more you use it';
    $('#buy-legend').innerHTML = '';
    drawChart(svg, {
      xMax, yMax, xLabel: 'Number of uses', xFmt: compact,
      series: [{ cls: 's-brand', fn: (x) => r.net / x, x0: (yTop) => r.net / yTop }],
      hline: { y: r.targetCost, label: `${TARGET_MIN} min of work = ${rs(r.targetCost)}` },
      markers: [{ x: r.totalUses, y: r.costPerUse, label: `Your plan: ${rs(r.costPerUse)} a use` }],
      alt: `Cost per use falls from ${rs(r.net)} for one use to ${rs(r.costPerUse)} at your planned ${count(r.totalUses)} uses.`,
    });
  }

  function renderHabit({ r, v }, horizon) {
    const rate = investRate(), inf = inflation();
    setVerdict($('#buy-verdict'), v,
      r.shareOfSalary == null ? 'Add your salary in Settings.' :
        `That's <b>${rs(r.perMonth)} a month</b>, ${pct(r.shareOfSalary)} of your take-home pay.`);
    const fv = C.futureValueMonthly(r.perMonth, rate, horizon);
    const spent = r.perYear * horizon;
    $('#buy-lenses').innerHTML =
      lens('Every year', rs(r.perYear), `${rs(r.perMonth)} a month`) +
      lens('Hours of your work', hoursText(r.hoursPerYear) + ' a year', workSpan(r.hoursPerYear) + ' every year') +
      lens('If you invested it', rs(fv),
        `putting ${rs(r.perMonth)} a month into ${preset().short} for ${horizon} ${plural(horizon, 'year', 'years')}. Growth adds ${rs(fv - spent)}.`);
    $('#buy-notes').innerHTML = [
      `Over ${horizon} ${plural(horizon, 'year', 'years')} you'd spend ${rs(spent)} on this. Invested, it would be worth about ${rs(C.inTodaysMoney(fv, inf, horizon))} in today's money.`,
      `Cutting it in half saves ${rs(r.perYear / 2)} a year.`,
    ].map((n) => `<li>${n}</li>`).join('');

    const spentPts = [[0, 0], [horizon, spent]];
    const invPts = [];
    for (let k = 0; k <= 60; k++) {
      const t = (horizon * k) / 60;
      invPts.push([t, C.futureValueMonthly(r.perMonth, rate, t)]);
    }
    $('#buy-chart-cap').innerHTML = '<b>Spend it or invest it?</b> Total in rupees over time';
    $('#buy-legend').innerHTML =
      `<span><i class="sw s-muted"></i>Spent: ${rs(spent)}</span><span><i class="sw s-brand"></i>Invested: ${rs(fv)}</span>`;
    drawChart($('#buy-chart'), {
      xMax: horizon, yMax: Math.max(fv, spent) * 1.05, xLabel: 'Years', xFmt: (x) => trim1(x),
      series: [{ cls: 's-muted', points: spentPts }, { cls: 's-brand', points: invPts }],
      alt: `Over ${horizon} years you'd spend ${rs(spent)}; invested, it would grow to ${rs(fv)}.`,
    });
  }

  /* ---------- wishlist ---------- */
  function renderWishlist() {
    const list = $('#wishlist');
    $('#wish-empty').hidden = state.wishlist.length > 0;
    list.innerHTML = state.wishlist.map((item, i) => {
      const res = computeBuy(Object.assign({}, DEFAULTS.buy, item.buy));
      const v = res.v || { emoji: '•', title: '' };
      const what = res.error ? '' : res.kind === 'habit'
        ? `${rs(res.r.perYear)} a year`
        : `${rs(res.price)}` + (res.r.costPerUse != null && res.r.net > 0 ? ` · ${rs(res.r.costPerUse)} a use` : '');
      return `<li><span class="wish-emoji" aria-hidden="true">${v.emoji}</span>
        <span class="wish-main"><b>${esc(item.buy.name || 'Unnamed')}</b><small>${what}${v.title ? ' · ' + esc(v.title) : ''}</small></span>
        <button type="button" class="btn small ghost" data-load="${i}">Open</button>
        <button type="button" class="btn small ghost" data-remove="${i}" aria-label="Remove ${esc(item.buy.name || 'item')}">✕</button></li>`;
    }).join('');
  }

  $('#save-btn').addEventListener('click', () => {
    const b = clone(state.buy);
    if (!b.name.trim()) b.name = b.kind === 'habit' ? 'Regular spend' : 'Something to buy';
    const existing = state.wishlist.findIndex((w) => w.buy.name === b.name);
    if (existing >= 0) state.wishlist[existing] = { buy: b, saved: Date.now() };
    else state.wishlist.unshift({ buy: b, saved: Date.now() });
    save();
    render();
    const msg = $('#saved-msg');
    msg.textContent = existing >= 0 ? 'Updated' : 'Saved';
    clearTimeout(msg._t);
    msg._t = setTimeout(() => { msg.textContent = ''; }, 1800);
  });

  $('#wishlist').addEventListener('click', (e) => {
    const load = e.target.closest('[data-load]');
    const remove = e.target.closest('[data-remove]');
    if (load) {
      state.buy = Object.assign(clone(DEFAULTS.buy), clone(state.wishlist[+load.dataset.load].buy));
      save(); syncInputs(); render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (remove) {
      state.wishlist.splice(+remove.dataset.remove, 1);
      save(); render();
    }
  });

  /* ---------- Easy payment ---------- */
  function renderEmi() {
    const e = state.emi;
    const cash = num(e.cash), monthly = num(e.monthly), months = Math.round(num(e.months)), down = num(e.down);
    const fees = e.feeUnit === 'pct' ? (num(e.fee) / 100) * cash : num(e.fee);
    const verdict = $('#emi-verdict');
    if (!(cash > 0) || !(monthly > 0) || !(months >= 1)) {
      verdict.className = 'verdict card lvl-none';
      verdict.innerHTML = '<div class="verdict-emoji" aria-hidden="true">💳</div><div><h2>Is the plan a good deal?</h2><p>Enter the cash price, the monthly payment and the number of months.</p></div>';
      $('#emi-lenses').innerHTML = $('#emi-notes').innerHTML = '';
      return;
    }
    const plan = C.installment({ cashPrice: cash, monthly, months, down, fees });
    const v = C.verdictInstallment(plan, investRate());
    let text;
    if (plan.extra <= 0.5) text = `You pay ${rs(plan.total)} in total, no more than the cash price.`;
    else if (plan.apr == null) text = 'The down payment and fees cover the whole price, so there is no loan to work out.';
    else text = `You pay <b>${rs(plan.extra)} more</b> than the cash price. That's like a loan at <b>${pct(plan.apr)} a year</b>.`;
    setVerdict(verdict, v, text);

    $('#emi-lenses').innerHTML =
      lens('You pay in total', rs(plan.total), `${months} × ${rs(monthly)}` + (down > 0 ? ` + ${rs(down)} down` : '') + (fees > 0 ? ` + ${rs(fees)} fees` : '')) +
      lens('Flat rate', pct(plan.flat), 'how plans are often advertised') +
      lens('True interest rate', pct(plan.apr), plan.effective != null ? `a year (${pct(plan.effective)} with monthly compounding)` : 'a year');

    const notes = [];
    if (plan.flat > 0.001 && plan.apr > 0) {
      notes.push(`The true rate is <b>${trim1(plan.apr / plan.flat)}×</b> the flat rate. Compare the true rate with loans and deposits, not the flat one.`);
    }
    if (fees > 0) notes.push(`The ${rs(fees)} fee is charged up front, so you really borrow ${rs(plan.received)}, not ${rs(plan.loan)}.`);
    const rate = investRate();
    const n = C.monthsToSave(cash - down, monthly, rate);
    if (n != null && plan.extra > 0.5) {
      notes.push(`Pay yourself first: saving ${rs(monthly)} a month in ${preset().short} at ${pct(rate)}, you could pay the ${rs(cash - down)} in cash after <b>${n} ${plural(n, 'month', 'months')}</b> and keep the ${rs(plan.extra)}.`);
    }
    $('#emi-notes').innerHTML = notes.map((x) => `<li>${x}</li>`).join('');
  }

  /* ---------- Settings ---------- */
  function renderPresets() {
    $('#presets').innerHTML = PRESETS.map((p) => `
      <div class="preset">
        <label class="preset-pick"><input type="radio" name="invest" value="${p.id}" data-bind="settings.investId">
          <span><b>${p.name}</b><small>${p.note}</small></span></label>
        <label class="affix rate"><span class="visually-hidden">${p.name} rate</span>
          <input type="text" inputmode="decimal" data-bind="settings.rates.${p.id}" data-type="money"><i>%</i></label>
      </div>`).join('');
  }

  function renderSettings() {
    const s = state.settings, hr = hourly();
    $('#set-hourly').innerHTML = hr > 0
      ? `That's about <b>${rs(hr)} an hour</b> of your time.`
      : 'Enter your salary and hours to work out your hourly rate.';
    const real = C.realRate(investRate(), inflation());
    $('#set-real').innerHTML = `${preset().name} at ${pct(investRate())} with ${pct(inflation())} inflation is a <b>real return of about ${pct(real)}</b> a year.` +
      (real < 0 ? ' <span class="bad-text">Your money would lose buying power.</span>' : '');
  }

  $('#reset-btn').addEventListener('click', () => {
    if (!window.confirm('Reset all your settings, entries and wishlist?')) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    state = clone(DEFAULTS);
    syncInputs();
    render();
  });

  /* ---------- views ---------- */
  const VIEWS = ['buy', 'emi', 'settings'];
  function currentView() {
    const v = location.hash.slice(1);
    return VIEWS.includes(v) ? v : 'buy';
  }
  function route() {
    const v = currentView();
    for (const id of VIEWS) $('#view-' + id).hidden = id !== v;
    for (const a of $$('.tabs a')) {
      if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    }
    render();
  }

  function render() {
    renderBuy();
    renderWishlist();
    renderEmi();
    renderSettings();
  }

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(renderBuy);
  });
  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });

  renderPresets();
  syncInputs();
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
