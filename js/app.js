(function () {
  const TOPICS = window.TOPICS;
  const UNITS = [...new Set(TOPICS.map((t) => t.unit))];
  const byId = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sub = (s) => esc(s).replace(/_([A-Za-z0-9]+)/g, '<sub>$1</sub>');

  function tex(src, display) {
    if (window.katex) {
      try { return window.katex.renderToString(src, { output: 'mathml', displayMode: !!display, throwOnError: false }); } catch (e) { /* fall through */ }
    }
    return `<code class="tex-fallback">${esc(src)}</code>`;
  }

  /* ── Storage (per-viewer convenience only) ── */
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } },
  };
  const mastered = new Set(store.get('mn-mastered', []));
  const saveMastered = () => store.set('mn-mastered', [...mastered]);

  /* ── State ── */
  const sliderState = {};
  // Param fields (min, max, step, value) may be functions of the state, so ranges follow the market.
  const rv = (v, s) => (typeof v === 'function' ? v(s) : v);
  function resetParams(t, s) {
    t.graph.params.forEach((p) => { s[p.id] = rv(p.value, s); });
    return s;
  }
  function initState(t) {
    const s = {};
    if (t.market) s.m = window.MARKET.build(t.market.demand, t.market.supply).m;
    return resetParams(t, s);
  }
  const stateFor = (t) => (sliderState[t.id] ||= initState(t));
  let query = '';

  const main = $('#main');
  const nav = $('#topic-nav');

  /* ── Sidebar ── */
  function matches(t, q) {
    if (!q) return true;
    const hay = [t.title, t.unit, t.block || '', t.summary, ...t.equations.map((e) => e.name)].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }

  function renderNav(activeId) {
    let html = '';
    for (const unit of UNITS) {
      const items = TOPICS.filter((t) => t.unit === unit && matches(t, query));
      if (!items.length) continue;
      html += `<div class="nav-group"><p class="nav-unit">${esc(unit)}</p><ul>`;
      for (const t of items) {
        html += `<li><a href="#${t.id}" class="nav-item${t.id === activeId ? ' active' : ''}"${t.id === activeId ? ' aria-current="page"' : ''}>
          <span class="nav-check${mastered.has(t.id) ? ' done' : ''}" aria-label="${mastered.has(t.id) ? 'Mastered' : 'Not yet mastered'}"></span>
          <span class="nav-title">${esc(t.title)}</span>${t.block ? `<span class="nav-block">${esc(t.block.replace(/Blocks? /, 'B'))}</span>` : ''}</a></li>`;
      }
      html += '</ul></div>';
    }
    nav.innerHTML = html || `<p class="nav-empty">No topic matches “${esc(query)}”.</p>`;
  }

  function renderProgress() {
    $('#prog-text').textContent = `${mastered.size} / ${TOPICS.length} mastered`;
    $('#prog-bar').style.width = (mastered.size / TOPICS.length) * 100 + '%';
  }

  /* ── Topic view ── */
  function renderTopic(t) {
    const idx = TOPICS.indexOf(t);
    const prev = TOPICS[idx - 1], next = TOPICS[idx + 1];
    const g = t.graph;
    const s = g ? stateFor(t) : null;
    const controls = g ? g.params.map((p) => p.options ? `
      <div class="ctrl">
        <span class="ctrl-label">${esc(p.label)}</span>
        <div class="seg" role="group" aria-label="${esc(p.label)}">
          ${p.options.map((o) => `<button type="button" id="p-${t.id}-${p.id}-${o.v}" data-param="${p.id}" data-v="${o.v}" aria-pressed="${s[p.id] === o.v}">${esc(o.label)}</button>`).join('')}
        </div>
        ${p.hint ? `<small>${esc(p.hint)}</small>` : ''}
      </div>` : `
      <div class="ctrl">
        <label for="p-${t.id}-${p.id}"><span>${esc(p.label)}</span><output id="o-${t.id}-${p.id}">${fmtParam(p, s[p.id], s)}</output></label>
        <input type="range" id="p-${t.id}-${p.id}" data-param="${p.id}" min="${rv(p.min, s)}" max="${rv(p.max, s)}" step="${rv(p.step, s)}" value="${s[p.id]}">
        ${p.hint ? `<small>${esc(p.hint)}</small>` : ''}
      </div>`).join('') : '';
    const actions = g && g.actions ? g.actions.map((a, i) => `<button type="button" class="primary" data-action="${i}">${esc(a.label)}</button>`).join('') : '';

    const figure = g ? `
          <section class="panel graph-panel" aria-label="Interactive graph">
            <div class="graph-wrap" id="graph"></div>
            ${t.market ? marketPanel(t, s) : `<p class="model"><span>Model</span> ${sub(t.model)}</p>`}
            <div class="controls">${controls}</div>
            <div class="readout-wrap">
              <dl class="readout" id="readout"></dl>
              <p class="status" id="status" hidden></p>
            </div>
            <div class="btn-row">${actions}<button type="button" class="ghost-btn" id="reset">Reset</button></div>
          </section>` : `
          <section class="panel graph-panel" aria-label="Diagram">
            <div class="graph-wrap">${t.diagram}</div>
            ${t.model ? `<p class="model"><span>Read it</span> ${esc(t.model)}</p>` : ''}
          </section>`;

    main.innerHTML = `
      <article class="topic">
        <header class="topic-head">
          <p class="eyebrow">${t.block ? esc(t.block) + ' <span aria-hidden="true">·</span> ' : ''}${esc(t.unit)}</p>
          <h1>${esc(t.title)}</h1>
          <p class="lede">${esc(t.summary)}</p>
          <button type="button" class="master-toggle" id="master-toggle" aria-pressed="${mastered.has(t.id)}">
            <span class="box" aria-hidden="true"></span><span class="lbl">${mastered.has(t.id) ? 'Mastered' : 'Mark as mastered'}</span>
          </button>
        </header>
        <div class="bench${g && g.panels && g.layout !== 'column' ? ' wide' : ''}">
          ${figure}
          <section class="eqs" aria-labelledby="eq-h">
            <h2 id="eq-h">Key equations</h2>
            <ul class="eq-list">
              ${t.equations.map((e) => `<li class="eq"><p class="eq-name">${esc(e.name)}</p><div class="eq-math">${tex(e.tex, true)}</div><p class="eq-note">${esc(e.note)}</p></li>`).join('')}
            </ul>
          </section>
        </div>
        <div class="notes">
          <section>
            <h2>Remember</h2>
            <ul class="points">${t.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
          </section>
          <aside class="tip">
            <h2>Exam tip</h2>
            <p>${esc(t.tip)}</p>
          </aside>
        </div>
        ${termsFor(t.id).length ? `<section class="key-terms" aria-labelledby="kt-h"><h2 id="kt-h">Key terms</h2><div class="kt-chips">${termsFor(t.id).map((g) => `<a class="kt" href="#${slug(g.term)}" title="${esc(g.def)}">${rich(g.term)}</a>`).join('')}</div></section>` : ''}
        ${WORKED.some((w) => w.topic === t.id) ? `<section class="topic-worked" aria-labelledby="tw-h"><h2 id="tw-h">Worked ${WORKED.filter((w) => w.topic === t.id).length > 1 ? 'examples' : 'example'}</h2>${WORKED.filter((w) => w.topic === t.id).map(workedCard).join('')}</section>` : ''}
        ${sheetsFor(t.id).length ? `<p class="rev-link">Revise this in: ${sheetsFor(t.id).map((sh) => `<a href="#${sh.id}">${esc(sh.block)} sheet</a>`).join(', ')}</p>` : ''}
        <nav class="pager" aria-label="Topic navigation">
          ${prev ? `<a href="#${prev.id}" class="pager-link"><small>Previous</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}
          ${next ? `<a href="#${next.id}" class="pager-link next"><small>Next</small><span>${esc(next.title)}</span></a>` : '<span></span>'}
        </nav>
      </article>`;

    bindMastered(t);
    if (!g) return;

    const draw = (limit) => {
      $('#graph').innerHTML = g.panels
        ? `<div class="panes ${g.layout || 'row'}">${g.panels.map((pn) => `<figure class="pane"><figcaption>${esc(rv(pn.title, s))}</figcaption>${window.renderGraph({ ...pn, aria: pn.title }, s)}</figure>`).join('')}</div>`
        : window.renderGraph({ ...g, aria: t.title + ' graph' }, s);
      const r = g.readout(s);
      $('#readout').innerHTML = r.rows.map(([k, v]) => `<div><dt>${sub(k)}</dt><dd>${sub(v)}</dd></div>`).join('');
      const st = $('#status');
      const msg = limit ? 'Limit reached. ' + limit : r.status;
      st.hidden = !msg;
      st.innerHTML = msg ? sub(msg) : '';
      st.dataset.tone = limit ? 'bad' : r.tone || 'info';
    };
    // Recompute ranges that depend on the market or on other sliders.
    const refreshRanges = () => {
      g.params.forEach((p) => {
        if (p.options) return;
        const inp = $(`#p-${t.id}-${p.id}`), min = rv(p.min, s), max = rv(p.max, s);
        inp.min = min; inp.max = max; inp.step = rv(p.step, s);
        s[p.id] = Math.min(max, Math.max(min, s[p.id]));
        inp.value = s[p.id];
        $(`#o-${t.id}-${p.id}`).textContent = fmtParam(p, s[p.id], s);
      });
    };
    // Push state values back into the controls (after reset or an action).
    const sync = () => {
      g.params.forEach((p) => {
        if (p.options) {
          p.options.forEach((o) => $(`#p-${t.id}-${p.id}-${o.v}`).setAttribute('aria-pressed', s[p.id] === o.v));
        }
      });
      refreshRanges();
      draw();
    };
    draw();

    main.querySelectorAll('input[type=range]').forEach((inp) => {
      inp.addEventListener('input', () => {
        const p = g.params.find((x) => x.id === inp.dataset.param);
        const old = s[p.id], target = parseFloat(inp.value);
        s[p.id] = target;
        const verdict = g.valid ? g.valid(s) : true;
        if (verdict !== true) {
          // Walk from the last good value toward the target and stop at the last valid step.
          const step = rv(p.step, s), dir = Math.sign(target - old), n = Math.floor(Math.abs(target - old) / step + 1e-9);
          let good = old, reason = verdict;
          for (let i = 1; i <= n; i++) {
            s[p.id] = +(old + dir * i * step).toFixed(10);
            const v = g.valid(s);
            if (v !== true) { reason = v; break; }
            good = s[p.id];
          }
          s[p.id] = good;
          refreshRanges();
          draw(reason);
          return;
        }
        refreshRanges();
        draw();
      });
    });
    main.querySelectorAll('.ctrl .seg button').forEach((b) => {
      b.addEventListener('click', () => { s[b.dataset.param] = parseFloat(b.dataset.v); sync(); });
    });
    main.querySelectorAll('[data-action]').forEach((b) => {
      b.addEventListener('click', () => { g.actions[+b.dataset.action].run(s); sync(); });
    });
    $('#reset').addEventListener('click', () => { resetParams(t, s); sync(); });

    if (t.market) {
      const apply = (dText, sText) => {
        const res = window.MARKET.build(dText, sText);
        const err = $('#fn-error');
        if (res.error) { err.hidden = false; err.textContent = res.error; return; }
        s.m = res.m;
        resetParams(t, s);
        renderTopic(t);
        const note = $('#fn-note');
        if (note) { note.hidden = false; note.textContent = 'Graph redrawn from your functions.'; }
      };
      $('#fn-form').addEventListener('submit', (e) => { e.preventDefault(); apply($('#fn-d').value, $('#fn-s').value); });
      $('#fn-example').addEventListener('click', () => apply(t.market.demand, t.market.supply));
      ['#fn-d', '#fn-s'].forEach((id) => $(id).addEventListener('input', () => { $('#fn-error').hidden = true; $('#fn-note').hidden = true; }));
    }
  }

  function marketPanel(t, s) {
    const m = s.m, e = window.MARKET.eqm(m);
    return `
      <form class="market" id="fn-form" novalidate>
        <p class="market-title">Your market functions</p>
        <div class="fn-grid">
          <label for="fn-d">${esc(t.market.dLabel || 'Demand')}</label>
          <input id="fn-d" class="fn" value="${esc(m.dText)}" spellcheck="false" autocomplete="off" placeholder="${esc(t.market.demand)}">
          <label for="fn-s">${esc(t.market.sLabel || 'Supply')}</label>
          <input id="fn-s" class="fn" value="${esc(m.sText)}" spellcheck="false" autocomplete="off" placeholder="${esc(t.market.supply)}">
        </div>
        <p class="fn-help">Type each line as Q = a − bP or P = a − bQ, for example <code>Qd = 120 − 10P</code> or <code>P = 2 + 0.1Q</code>.</p>
        <p class="fn-error" id="fn-error" role="alert" hidden></p>
        <p class="fn-note" id="fn-note" role="status" hidden></p>
        <div class="btn-row"><button type="submit" class="primary">Draw my market</button><button type="button" class="ghost-btn" id="fn-example">Use example</button></div>
        <p class="model"><span>Model</span> ${sub(window.MARKET.describe(m))} Free-market equilibrium: P* = ${e.p.toFixed(2)}, Q* = ${e.q.toFixed(2)}.</p>
      </form>`;
  }

  function bindMastered(t) {
    $('#master-toggle').addEventListener('click', (ev) => {
      const btn = ev.currentTarget;
      if (mastered.has(t.id)) mastered.delete(t.id); else mastered.add(t.id);
      saveMastered();
      btn.setAttribute('aria-pressed', mastered.has(t.id));
      $('.lbl', btn).textContent = mastered.has(t.id) ? 'Mastered' : 'Mark as mastered';
      renderNav(t.id);
      renderProgress();
    });
  }

  function fmtParam(p, v, s) {
    const step = rv(p.step, s);
    const decimals = (String(+Number(step).toPrecision(6)).split('.')[1] || '').length;
    return Number(v).toFixed(Math.min(decimals, 6));
  }

  /* ── Formula sheet ── */
  function renderSheet() {
    main.innerHTML = `
      <article class="sheet">
        <header class="topic-head">
          <p class="eyebrow">Reference</p>
          <h1>Formula sheet</h1>
          <p class="lede">Every equation in the kit on one page. Filter by name, topic or unit, then open a topic to see its graph.</p>
          <label class="sheet-filter" for="sheet-filter"><span class="visually-hidden">Filter formulas</span>
            <input type="search" id="sheet-filter" placeholder="Filter formulas, e.g. multiplier, elasticity" value="${esc(query)}">
          </label>
        </header>
        <div id="sheet-body"></div>
      </article>`;
    const body = $('#sheet-body');
    const paint = () => {
      const q = query.toLowerCase();
      let html = '', count = 0;
      for (const unit of UNITS) {
        let unitHtml = '';
        for (const t of TOPICS.filter((x) => x.unit === unit)) {
          const topicHit = !q || (t.title + ' ' + unit).toLowerCase().includes(q);
          const eqs = t.equations.filter((e) => topicHit || (e.name + ' ' + e.note).toLowerCase().includes(q));
          if (!eqs.length) continue;
          count += eqs.length;
          unitHtml += `<section class="sheet-topic"><h3><a href="#${t.id}">${esc(t.title)}</a></h3><div class="sheet-grid">
            ${eqs.map((e) => `<div class="sheet-eq"><p class="eq-name">${esc(e.name)}</p><div class="eq-math">${tex(e.tex, true)}</div><p class="eq-note">${esc(e.note)}</p></div>`).join('')}
          </div></section>`;
        }
        if (unitHtml) html += `<h2 class="sheet-unit">${esc(unit)}</h2>${unitHtml}`;
      }
      body.innerHTML = html || `<p class="empty">No formula matches “${esc(query)}”. Try a shorter word.</p>`;
      return count;
    };
    paint();
    const input = $('#sheet-filter');
    input.addEventListener('input', () => { query = input.value.trim(); $('#search').value = query; renderNav(null); paint(); });
  }

  /* ── Rich text: x^{2}, x_{t-1} and Q_D style sub/superscripts in plain strings ── */
  const rich = (s) => esc(s)
    .replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>')
    .replace(/_\{([^}]*)\}/g, '<sub>$1</sub>')
    .replace(/_([A-Za-z0-9]+)/g, '<sub>$1</sub>');

  /* ── Glossary ── */
  const GLOSSARY = (window.GLOSSARY || []).slice().sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
  const slug = (s) => 'g-' + s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const termsFor = (id) => GLOSSARY.filter((g) => g.topics.includes(id));
  const topicLinks = (ids) => ids.filter((id) => byId[id]).map((id) => `<a href="#${id}">${esc(byId[id].title)}</a>`).join(', ');

  function renderGlossary(focus) {
    // A link to one term must show it, so clear any filter that could hide it.
    if (focus && query) { query = ''; $('#search').value = ''; renderNav(null); }
    main.innerHTML = `
      <article class="glossary">
        <header class="topic-head">
          <p class="eyebrow">Reference</p>
          <h1>Glossary</h1>
          <p class="lede">${GLOSSARY.length} key terms with plain-language definitions. Each links to the topics where it is used.</p>
          <label class="sheet-filter" for="gl-filter"><span class="visually-hidden">Filter terms</span>
            <input type="search" id="gl-filter" placeholder="Filter terms and definitions, e.g. elasticity, surplus" value="${esc(query)}">
          </label>
          <nav class="az" id="gl-az" aria-label="Jump to letter"></nav>
        </header>
        <div id="gl-body"></div>
      </article>`;
    const paint = () => {
      const q = query.toLowerCase();
      const hits = GLOSSARY.filter((g) => !q || (g.term + ' ' + g.def).toLowerCase().includes(q));
      const groups = {};
      hits.forEach((g) => { const L = g.term[0].toUpperCase(); (groups[L] ||= []).push(g); });
      const letters = Object.keys(groups).sort();
      $('#gl-az').innerHTML = letters.map((L) => `<button type="button" data-letter="${L}">${L}</button>`).join('');
      $('#gl-body').innerHTML = letters.length ? letters.map((L) => `
        <section class="gl-letter" id="gl-${L}">
          <h2>${L}</h2>
          <dl>${groups[L].map((g) => `
            <div class="gl-entry" id="${slug(g.term)}">
              <dt>${rich(g.term)}</dt>
              <dd>${rich(g.def)}${g.topics.length ? `<span class="gl-topics">See: ${topicLinks(g.topics)}</span>` : ''}</dd>
            </div>`).join('')}</dl>
        </section>`).join('') : `<p class="empty">No term matches “${esc(query)}”.</p>`;
    };
    paint();
    $('#gl-filter').addEventListener('input', (e) => { query = e.target.value.trim(); $('#search').value = query; renderNav(null); paint(); });
    $('#gl-az').addEventListener('click', (e) => { const b = e.target.closest('[data-letter]'); if (b) $('#gl-' + b.dataset.letter)?.scrollIntoView({ block: 'start' }); });
    if (focus) {
      const el = document.getElementById(focus);
      if (el) { el.classList.add('target'); requestAnimationFrame(() => el.scrollIntoView({ block: 'center' })); }
    }
  }

  /* ── Worked answers ── */
  const WORKED = window.WORKED || [];
  const revealed = new Map(); // example id → number of steps shown
  const KIND = { calc: 'Calculation', diagram: 'Diagram answer' };

  function workedCard(w) {
    const t = byId[w.topic], n = revealed.get(w.id) || 0, done = n >= w.steps.length;
    return `
      <article class="wk" id="${w.id}" data-wk="${w.id}">
        <p class="card-kicker">${t ? `${esc(t.block || t.unit)} <span aria-hidden="true">·</span> <a href="#${t.id}">${esc(t.title)}</a> <span aria-hidden="true">·</span> ` : ''}${KIND[w.kind]}</p>
        <h3>${rich(w.title)}</h3>
        <p class="wk-q"><strong>Question.</strong> ${rich(w.question)}</p>
        <ol class="wk-steps">${w.steps.slice(0, n).map((st) => `<li><p>${rich(st.t)}</p>${st.m ? `<div class="eq-math">${tex(st.m, true)}</div>` : ''}</li>`).join('')}</ol>
        ${done ? `<div class="wk-answer"><p><strong>Answer.</strong> ${rich(w.answer)}</p>${w.mistakes?.length ? `<p class="wk-mistakes-h">Common mistakes</p><ul class="wk-mistakes">${w.mistakes.map((m) => `<li>${rich(m)}</li>`).join('')}</ul>` : ''}</div>` : ''}
        <div class="btn-row">
          ${done ? '' : `<button type="button" class="primary" data-wk-act="next">${n ? 'Next step' : 'Start the run-through'} <span class="wk-count">${n}/${w.steps.length}</span></button><button type="button" class="ghost-btn" data-wk-act="all">Show full answer</button>`}
          ${n ? '<button type="button" class="ghost-btn" data-wk-act="hide">Hide answer</button>' : ''}
          ${hasDrill(w.id) ? `<a class="ghost-btn" href="#q-${w.id}">Practise with new numbers</a>` : ''}
        </div>
      </article>`;
  }
  // One delegated handler serves cards on the topic page and on the Worked answers page.
  main.addEventListener('click', (e) => {
    const b = e.target.closest('[data-wk-act]');
    if (!b) return;
    const card = b.closest('[data-wk]'), w = WORKED.find((x) => x.id === card.dataset.wk);
    const n = revealed.get(w.id) || 0;
    revealed.set(w.id, b.dataset.wkAct === 'next' ? n + 1 : b.dataset.wkAct === 'all' ? w.steps.length : 0);
    card.outerHTML = workedCard(w);
    const again = document.getElementById(w.id);
    (again.querySelector('[data-wk-act="next"]') || again.querySelector('[data-wk-act]'))?.focus({ preventScroll: true });
  });

  const wkFilter = { unit: 'All', kind: 'all' };
  function renderWorked(focus) {
    const units = ['All', ...UNITS.filter((u) => WORKED.some((w) => byId[w.topic]?.unit === u))];
    const list = WORKED.filter((w) => (wkFilter.unit === 'All' || byId[w.topic]?.unit === wkFilter.unit) && (wkFilter.kind === 'all' || w.kind === wkFilter.kind));
    main.innerHTML = `
      <article class="worked">
        <header class="topic-head">
          <p class="eyebrow">Practice</p>
          <h1>Worked answers</h1>
          <p class="lede">Exam-style questions solved one step at a time. Try each step yourself, then reveal it. Every run-through ends with the final answer and the mistakes examiners see most.</p>
        </header>
        <div class="card-bar">
          <div class="chips" role="group" aria-label="Unit">${units.map((u) => `<button type="button" class="chip" data-wk-unit="${esc(u)}" aria-pressed="${wkFilter.unit === u}">${esc(u)}</button>`).join('')}</div>
          <div class="seg" role="group" aria-label="Question type">
            ${[['all', 'All'], ['calc', 'Calculations'], ['diagram', 'Diagram answers']].map(([v, l]) => `<button type="button" data-wk-kind="${v}" aria-pressed="${wkFilter.kind === v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="wk-list">${list.map(workedCard).join('') || '<p class="empty">No run-throughs match this filter.</p>'}</div>
      </article>`;
    main.querySelectorAll('[data-wk-unit]').forEach((b) => b.addEventListener('click', () => { wkFilter.unit = b.dataset.wkUnit; renderWorked(); }));
    main.querySelectorAll('[data-wk-kind]').forEach((b) => b.addEventListener('click', () => { wkFilter.kind = b.dataset.wkKind; renderWorked(); }));
    if (focus) { const el = document.getElementById(focus); if (el) { el.classList.add('target'); requestAnimationFrame(() => el.scrollIntoView({ block: 'start' })); } }
  }

  /* ── Practice quiz ── */
  const QUIZ_ITEMS = (window.QUIZ && window.QUIZ.items) || [];
  const workedById = Object.fromEntries(WORKED.map((w) => [w.id, w]));
  const hasDrill = (id) => QUIZ_ITEMS.some((it) => it.worked === id);
  const quiz = { phase: 'setup', opts: { n: 10, area: 'All', type: 'mixed' }, list: [], i: 0, label: '' };
  const fmtAns = (v) => String(+(+v).toFixed(Math.abs(v) < 1 && v !== 0 ? 3 : 2));
  const parseNum = (raw) => {
    const s = String(raw).replace(/[−–—]/g, '-').replace(/[,£$%\s]/g, '');
    if (!s) return NaN;
    const frac = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
    return frac ? parseFloat(frac[1]) / parseFloat(frac[2]) : Number(s);
  };
  const closeEnough = (v, a) => Number.isFinite(v) && Math.abs(v - a) <= Math.max(0.01, Math.abs(a) * 0.01);

  function quizPool(o) {
    return QUIZ_ITEMS.filter((it) => (o.area === 'All' || byId[it.topic]?.unit === o.area) && (o.type === 'mixed' || (o.type === 'calc' ? it.kind === 'calc' : it.kind === 'concept')));
  }
  function startQuiz(items, count, label) {
    const order = shuffle(items.slice()), list = [];
    for (let k = 0; k < count; k++) {
      const it = order[k % order.length];
      list.push({ it, inst: it.make(), given: [], ok: [], checked: false });
    }
    Object.assign(quiz, { phase: 'run', list, i: 0, label });
  }
  const marks = () => quiz.list.reduce((s, x) => s + x.ok.filter(Boolean).length, 0);
  const totalMarks = () => quiz.list.reduce((s, x) => s + x.inst.parts.length, 0);

  function renderQuiz() {
    const head = (lede) => `
      <header class="topic-head">
        <p class="eyebrow">Practice</p>
        <h1>Quiz</h1>
        <p class="lede">${lede}</p>
      </header>`;

    if (quiz.phase === 'setup') {
      const o = quiz.opts, pool = quizPool(o), best = store.get('mn-quiz-best', null);
      const seg = (name, val, opts) => `<div class="seg" role="group" aria-label="${name}">${opts.map(([v, l]) => `<button type="button" data-q-${name}="${v}" aria-pressed="${String(val) === String(v)}">${l}</button>`).join('')}</div>`;
      main.innerHTML = `<article class="quiz">${head('Questions built on the worked answers, with new numbers every time, so you practise the method rather than remembering the example. Calculation answers are accepted within 1%.')}
        <div class="quiz-setup panel">
          <div class="q-row"><span class="ctrl-label">Questions</span>${seg('n', o.n, [[5, '5'], [10, '10'], [15, '15']])}</div>
          <div class="q-row"><span class="ctrl-label">Area</span>${seg('area', o.area, [['All', 'All'], ...UNITS.filter((u) => QUIZ_ITEMS.some((it) => byId[it.topic]?.unit === u)).map((u) => [u, u])])}</div>
          <div class="q-row"><span class="ctrl-label">Type</span>${seg('type', o.type, [['mixed', 'Mixed'], ['calc', 'Calculations'], ['concept', 'Concepts']])}</div>
          <p class="q-pool">${pool.length} question types match.${best ? ` Best score so far: ${best.pct}% (${best.marks}/${best.total}).` : ''}</p>
          <div class="btn-row"><button type="button" class="primary" id="q-start" ${pool.length ? '' : 'disabled'}>Start quiz</button></div>
        </div></article>`;
      ['n', 'area', 'type'].forEach((name) => main.querySelectorAll(`[data-q-${name}]`).forEach((b) => b.addEventListener('click', () => {
        const v = b.getAttribute(`data-q-${name}`); quiz.opts[name] = name === 'n' ? +v : v; renderQuiz();
      })));
      $('#q-start')?.addEventListener('click', () => { startQuiz(quizPool(quiz.opts), quiz.opts.n, ''); renderQuiz(); $('.q-card input, .q-card [type=radio]')?.focus(); });
      return;
    }

    if (quiz.phase === 'done') {
      const m = marks(), T = totalMarks(), pctv = Math.round((100 * m) / T);
      if (!quiz.label) {
        const best = store.get('mn-quiz-best', null);
        if (!best || pctv > best.pct) store.set('mn-quiz-best', { pct: pctv, marks: m, total: T });
      }
      const missed = quiz.list.filter((x) => x.ok.some((v) => !v));
      main.innerHTML = `<article class="quiz">${head(quiz.label ? `Drill finished: ${esc(quiz.label)}.` : 'Quiz finished.')}
        <div class="q-score panel"><p class="q-big">${m} / ${T}</p><p>${pctv}% of marks. ${missed.length ? `${missed.length} question${missed.length > 1 ? 's' : ''} had at least one wrong part.` : 'Every part correct.'}</p>
          <div class="btn-row">
            ${missed.length ? '<button type="button" class="primary" id="q-retry">Retry the missed ones with new numbers</button>' : ''}
            <button type="button" class="${missed.length ? 'ghost-btn' : 'primary'}" id="q-again">New quiz, same settings</button>
            <button type="button" class="ghost-btn" id="q-setup">Change settings</button>
          </div></div>
        <ol class="q-review">${quiz.list.map((x) => {
          const w = workedById[x.it.worked], good = x.ok.filter(Boolean).length, all = x.ok.length;
          return `<li class="${good === all ? 'ok' : 'bad'}"><span class="q-mark">${good}/${all}</span> ${rich(x.inst.q.length > 110 ? x.inst.q.slice(0, 107) + '…' : x.inst.q)} <a href="#${x.it.worked}">${esc(w ? w.title : 'Run-through')}</a></li>`;
        }).join('')}</ol></article>`;
      $('#q-retry')?.addEventListener('click', () => { startQuiz(missed.map((x) => x.it), missed.length, quiz.label ? quiz.label + ' (retry)' : 'missed questions'); renderQuiz(); });
      $('#q-again').addEventListener('click', () => { startQuiz(quizPool(quiz.opts), quiz.opts.n, ''); renderQuiz(); });
      $('#q-setup').addEventListener('click', () => { quiz.phase = 'setup'; renderQuiz(); });
      return;
    }

    // Running
    const x = quiz.list[quiz.i], t = byId[x.it.topic], w = workedById[x.it.worked];
    const partHtml = (p, k) => {
      const state = x.checked ? (x.ok[k] ? ' ok' : ' bad') : '';
      const fb = x.checked ? `<span class="q-fb">${x.ok[k] ? 'Correct' : `Answer: ${p.choices ? esc(p.choices[p.correct]) : fmtAns(p.answer)}`}</span>` : '';
      if (p.choices) {
        return `<fieldset class="q-part${state}"><legend>${rich(p.label)}</legend><div class="q-choices">${p.choices.map((c, ci) => `
          <label class="q-choice${x.checked && ci === p.correct ? ' right' : ''}"><input type="radio" name="qp${k}" value="${ci}" ${x.given[k] === ci ? 'checked' : ''} ${x.checked ? 'disabled' : ''}> <span>${rich(c)}</span></label>`).join('')}</div>${fb}</fieldset>`;
      }
      return `<div class="q-part${state}"><label for="qp${k}">${rich(p.label)}</label><div class="q-input"><input id="qp${k}" inputmode="decimal" autocomplete="off" value="${x.given[k] !== undefined ? esc(x.given[k]) : ''}" ${x.checked ? 'disabled' : ''}>${fb}</div></div>`;
    };
    main.innerHTML = `<article class="quiz">${head(quiz.label ? `Practising: ${esc(quiz.label)}. New numbers each time.` : 'Type numbers to 2 decimal places where needed. Fractions like 1/3 are fine.')}
      <div class="card-meter"><span>Question ${quiz.i + 1} of ${quiz.list.length} · ${marks()} marks so far</span><div class="bar"><i style="width:${(100 * quiz.i) / quiz.list.length}%"></i></div></div>
      <form class="q-card panel" id="q-form" novalidate>
        <p class="card-kicker">${t ? `${esc(t.block || t.unit)} <span aria-hidden="true">·</span> ${esc(t.title)} <span aria-hidden="true">·</span> ` : ''}${x.it.kind === 'calc' ? 'Calculation' : 'Concept'}</p>
        <p class="q-text">${rich(x.inst.q)}</p>
        ${x.inst.parts.map(partHtml).join('')}
        <p class="fn-error" id="q-err" role="alert" hidden></p>
        ${x.checked ? `<div class="wk-answer"><p><strong>Solution</strong></p><ol class="q-sol">${x.inst.solution.map((st) => `<li>${rich(st)}</li>`).join('')}</ol>${w ? `<p class="q-link">Full run-through: <a href="#${w.id}">${esc(w.title)}</a></p>` : ''}</div>` : ''}
        <div class="btn-row">
          ${x.checked ? `<button type="submit" class="primary" id="q-next">${quiz.i + 1 < quiz.list.length ? 'Next question' : 'See results'}</button>` : '<button type="submit" class="primary">Check answer</button>'}
          <button type="button" class="ghost-btn" id="q-quit">End quiz</button>
        </div>
      </form></article>`;

    $('#q-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (x.checked) {
        quiz.i += 1;
        if (quiz.i >= quiz.list.length) quiz.phase = 'done';
        renderQuiz();
        $('.q-card input:not([disabled])')?.focus();
        return;
      }
      const given = x.inst.parts.map((p, k) => {
        if (p.choices) { const r = main.querySelector(`input[name="qp${k}"]:checked`); return r ? +r.value : undefined; }
        return $(`#qp${k}`).value.trim();
      });
      if (given.some((g) => g === undefined || g === '')) {
        const err = $('#q-err'); err.hidden = false; err.textContent = 'Answer every part before checking.'; return;
      }
      x.given = given;
      x.ok = x.inst.parts.map((p, k) => (p.choices ? given[k] === p.correct : closeEnough(parseNum(given[k]), p.answer)));
      x.checked = true;
      recordResult(x.it, x.ok.every(Boolean));
      renderQuiz();
      $('#q-next')?.focus();
    });
    $('#q-quit').addEventListener('click', () => { quiz.list = quiz.list.slice(0, quiz.i + (x.checked ? 1 : 0)); quiz.phase = quiz.list.length ? 'done' : 'setup'; renderQuiz(); });
  }

  /* ── Revision: progress, spaced review and block sheets ── */
  const SHEETS = window.REVISION || [];
  const DAY = 864e5;
  const BOX_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }; // days until a correct answer is due again
  const getStats = () => store.get('mn-quiz-stats', {});
  // Called after each checked quiz question. A fully correct answer moves the item up a box
  // (seen again later); any wrong part sends it back to box 1, due again today.
  function recordResult(it, allRight) {
    if (!it.key) return;
    const st = getStats(), now = Date.now(), r = st[it.key] || { a: 0, c: 0, box: 0, due: now };
    r.a += 1;
    if (allRight) { r.c += 1; r.box = Math.min(5, r.box + 1); r.due = now + BOX_DAYS[r.box] * DAY; }
    else { r.box = 1; r.due = now; }
    st[it.key] = r;
    store.set('mn-quiz-stats', st);
  }
  const dueItems = () => { const st = getStats(), now = Date.now(); return QUIZ_ITEMS.filter((it) => st[it.key] && st[it.key].due <= now); };
  const checks = () => store.get('mn-revise-checks', {});
  const ticked = (sheet) => (checks()[sheet.id] || []).length;
  const sheetsFor = (topicId) => SHEETS.filter((sh) => sh.topics.includes(topicId));

  function readiness() {
    const total = SHEETS.reduce((s, sh) => s + sh.outcomes.length, 0), done = SHEETS.reduce((s, sh) => s + ticked(sh), 0);
    const st = getStats(), vals = Object.values(st), a = vals.reduce((s, r) => s + r.a, 0), c = vals.reduce((s, r) => s + r.c, 0);
    // Weakest topics: accuracy over every quiz item for that topic that has been attempted.
    const byTopic = {};
    QUIZ_ITEMS.forEach((it) => { const r = st[it.key]; if (!r) return; const tt = (byTopic[it.topic] ||= { a: 0, c: 0, worked: it.worked }); tt.a += r.a; tt.c += r.c; });
    const weak = Object.entries(byTopic).filter(([, v]) => v.c < v.a).map(([id, v]) => ({ id, acc: v.c / v.a, n: v.a, worked: v.worked })).sort((x, y) => x.acc - y.acc).slice(0, 5);
    return { total, done, a, c, weak, due: dueItems().length };
  }

  function planFor(dateStr) {
    if (!dateStr) return '<p class="q-pool">Set your exam date to get a day-by-day plan through every block sheet.</p>';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const exam = new Date(dateStr + 'T00:00:00');
    const days = Math.round((exam - today) / DAY);
    if (!Number.isFinite(days)) return '';
    if (days <= 0) return '<p class="q-pool">That date is today or has passed. Use the due-review queue and the quiz for last-minute practice.</p>';
    const review = days >= 5 ? Math.max(1, Math.round(days * 0.2)) : 0, study = days - review;
    const rows = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(today.getTime() + d * DAY);
      const label = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
      const todays = d < study ? SHEETS.filter((_, i) => Math.floor((i * study) / SHEETS.length) === d) : [];
      const work = d >= study
        ? 'Mixed review: due questions, a 15-question quiz, and any unticked checklist items'
        : todays.length
          ? todays.map((sh) => `<a href="#${sh.id}">${esc(sh.block)}: ${esc(sh.title)}</a> <span class="pl-prog">${ticked(sh)}/${sh.outcomes.length}</span>`).join('<br>')
          : 'Catch up, or redo the quiz for the last block';
      rows.push(`<li class="${d === 0 ? 'today' : ''}"><span class="pl-date">${d === 0 ? 'Today' : label}</span><span>${work}</span></li>`);
    }
    return `<p class="q-pool">${days} day${days > 1 ? 's' : ''} to go: ${study} for the block sheets${review ? `, then ${review} of mixed review` : ''}.</p><ol class="plan">${rows.join('')}</ol>`;
  }

  function sheetHtml(sh, open) {
    const done = ticked(sh), mine = checks()[sh.id] || [];
    const terms = GLOSSARY.filter((g) => g.topics.some((tid) => sh.topics.includes(tid))).slice(0, 16);
    const runs = WORKED.filter((w) => sh.topics.includes(w.topic));
    const testable = QUIZ_ITEMS.some((it) => sh.topics.includes(it.topic));
    return `
      <details class="rev" id="${sh.id}" ${open ? 'open' : ''}>
        <summary>
          <span class="rev-block">${esc(sh.block)}</span>
          <span class="rev-title">${esc(sh.title)}</span>
          <span class="rev-prog" id="rp-${sh.id}">${done}/${sh.outcomes.length}</span>
        </summary>
        <div class="rev-body">
          ${sh.note ? `<p class="rev-note">${rich(sh.note)}</p>` : ''}
          <p class="rev-sum">${rich(sh.summary)}</p>
          <section><h3>You should be able to</h3>
            <ul class="rev-checks">${sh.outcomes.map((o, i) => `<li><label><input type="checkbox" data-sheet="${sh.id}" data-i="${i}" ${mine.includes(i) ? 'checked' : ''}> <span>${rich(o)}</span></label></li>`).join('')}</ul>
          </section>
          <section><h3>${sh.note ? 'Key equations' : 'Key equations from the guide'}</h3>
            <ul class="rev-eqs">${sh.equations.map((e) => `<li><p class="eq-name">${esc(e.name)}</p><div class="eq-math">${tex(e.tex, true)}</div></li>`).join('')}</ul>
          </section>
          <div class="rev-cols">
            <section><h3>Graphs to practise</h3><ul class="rev-links">${sh.graphs.map((gr) => `<li><a href="#${gr.topic}">${rich(gr.label)}</a></li>`).join('')}</ul></section>
            <section><h3>Exam focus</h3><ul class="rev-focus">${sh.examFocus.map((f) => `<li>${rich(f)}</li>`).join('')}</ul></section>
          </div>
          ${runs.length ? `<section><h3>Worked answers</h3><ul class="rev-links">${runs.map((w) => `<li><a href="#${w.id}">${rich(w.title)}</a></li>`).join('')}</ul></section>` : ''}
          ${terms.length ? `<section><h3>Key terms</h3><div class="kt-chips">${terms.map((g) => `<a class="kt" href="#${slug(g.term)}" title="${esc(g.def)}">${rich(g.term)}</a>`).join('')}</div></section>` : ''}
          ${testable ? `<div class="btn-row"><button type="button" class="primary" data-test-sheet="${sh.id}">Test this block (6 questions)</button></div>` : ''}
        </div>
      </details>`;
  }

  const openSheets = new Set();
  let resetArmed = false;
  function renderRevise(focus) {
    if (focus) openSheets.add(focus);
    const r = readiness(), examDate = store.get('mn-exam-date', '');
    const pctReady = r.total ? Math.round((100 * r.done) / r.total) : 0;
    main.innerHTML = `
      <article class="revise">
        <header class="topic-head">
          <p class="eyebrow">Revision</p>
          <h1>Revision planner</h1>
          <p class="lede">One sheet per study block of the EC1002 guide breakdown: what you should be able to do, the guide’s equations, the graphs to practise and a quick test. Your breakdown groups Blocks 6–8, 17–18 and 19–20, so the sheets do the same. It did not list Block 14, so that sheet uses standard money-and-banking material.</p>
        </header>
        <section class="rev-dash">
          <div class="stat"><p class="stat-k">Checklist</p><p class="stat-v" id="rd-ready">${pctReady}%</p><p class="stat-s" id="rd-ready-s">${r.done} of ${r.total} can-do statements ticked</p><div class="bar"><i id="rd-bar" style="width:${pctReady}%"></i></div></div>
          <div class="stat"><p class="stat-k">Quiz accuracy</p><p class="stat-v">${r.a ? Math.round((100 * r.c) / r.a) + '%' : '—'}</p><p class="stat-s">${r.a ? `${r.c} of ${r.a} questions fully right` : 'Take a quiz to start tracking'}</p></div>
          <div class="stat"><p class="stat-k">Due for review</p><p class="stat-v">${r.due}</p><p class="stat-s">${r.due ? 'Questions you missed, or are due again' : 'Nothing due right now'}</p>${r.due ? '<button type="button" class="primary" id="rv-due">Review due questions</button>' : ''}</div>
        </section>
        ${r.weak.length ? `<section class="rev-weak"><h2>Weakest topics</h2><ul>${r.weak.map((w) => `<li><a href="#${w.id}">${esc(byId[w.id]?.title || w.id)}</a> <span class="pl-prog">${Math.round(100 * w.acc)}% of ${w.n}</span> <a class="ghost-btn" href="#q-${w.worked}">Drill</a></li>`).join('')}</ul></section>` : ''}
        <section class="rev-plan">
          <h2>Exam plan</h2>
          <label class="plan-date" for="exam-date"><span>Exam date</span> <input type="date" id="exam-date" value="${esc(examDate)}"></label>
          <div id="plan-body">${planFor(examDate)}</div>
        </section>
        <section class="rev-sheets">
          <h2>Block revision sheets</h2>
          <div class="btn-row"><button type="button" class="ghost-btn" id="rv-open">Open all</button><button type="button" class="ghost-btn" id="rv-close">Close all</button><button type="button" class="ghost-btn" id="rv-reset">${resetArmed ? 'Click again to clear all progress' : 'Reset revision progress'}</button></div>
          ${['Microeconomics', 'Macroeconomics'].map((part) => `<h3 class="rev-part">${part}</h3>${SHEETS.filter((sh) => sh.part === part).map((sh) => sheetHtml(sh, openSheets.has(sh.id))).join('')}`).join('')}
        </section>
      </article>`;

    $('#rv-due')?.addEventListener('click', () => { const d = shuffle(dueItems()); startQuiz(d, Math.min(15, d.length), 'questions due for review'); location.hash = 'quiz'; });
    $('#exam-date').addEventListener('change', (e) => { store.set('mn-exam-date', e.target.value); $('#plan-body').innerHTML = planFor(e.target.value); });
    $('#rv-open').addEventListener('click', () => { SHEETS.forEach((sh) => openSheets.add(sh.id)); main.querySelectorAll('details.rev').forEach((d) => { d.open = true; }); });
    $('#rv-close').addEventListener('click', () => { openSheets.clear(); main.querySelectorAll('details.rev').forEach((d) => { d.open = false; }); });
    $('#rv-reset').addEventListener('click', () => {
      // Two-step confirmation inside the page (confirm() is unavailable in the viewer).
      if (!resetArmed) { resetArmed = true; $('#rv-reset').textContent = 'Click again to clear all progress'; setTimeout(() => { resetArmed = false; const b = $('#rv-reset'); if (b) b.textContent = 'Reset revision progress'; }, 4000); return; }
      resetArmed = false;
      store.set('mn-revise-checks', {}); store.set('mn-quiz-stats', {}); store.set('mn-quiz-best', null);
      renderRevise();
    });
    main.querySelectorAll('details.rev').forEach((d) => d.addEventListener('toggle', () => { if (d.open) openSheets.add(d.id); else openSheets.delete(d.id); }));
    main.querySelectorAll('[data-test-sheet]').forEach((b) => b.addEventListener('click', () => {
      const sh = SHEETS.find((x) => x.id === b.dataset.testSheet), items = QUIZ_ITEMS.filter((it) => sh.topics.includes(it.topic));
      startQuiz(items, 6, `${sh.block}: ${sh.title}`); location.hash = 'quiz';
    }));
    main.querySelectorAll('.rev-checks input').forEach((cb) => cb.addEventListener('change', () => {
      const all = checks(), id = cb.dataset.sheet, i = +cb.dataset.i, set = new Set(all[id] || []);
      if (cb.checked) set.add(i); else set.delete(i);
      all[id] = [...set]; store.set('mn-revise-checks', all);
      const sh = SHEETS.find((x) => x.id === id), rr = readiness(), p = rr.total ? Math.round((100 * rr.done) / rr.total) : 0;
      $('#rp-' + id).textContent = `${ticked(sh)}/${sh.outcomes.length}`;
      $('#rd-ready').textContent = p + '%'; $('#rd-ready-s').textContent = `${rr.done} of ${rr.total} can-do statements ticked`; $('#rd-bar').style.width = p + '%';
      if (store.get('mn-exam-date', '')) $('#plan-body').innerHTML = planFor(store.get('mn-exam-date', ''));
    }));
    if (focus) { const el = document.getElementById(focus); if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' })); }
  }

  /* ── Flashcards ── */
  const allCards = TOPICS.flatMap((t) => t.equations.map((e) => ({ ...e, topic: t })));
  const defCards = (window.GLOSSARY || []).filter((g) => byId[g.topics[0]]).map((g) => ({ name: g.term, note: g.def, def: true, topic: byId[g.topics[0]] }));
  const cards = { unit: 'All', dir: 'name', deck: [], known: 0, flipped: false, kind: 'formulas' };

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function newDeck() {
    cards.deck = shuffle((cards.kind === 'defs' ? defCards : allCards).filter((c) => cards.unit === 'All' || c.topic.unit === cards.unit));
    cards.known = 0;
    cards.flipped = false;
  }

  function renderCards() {
    if (!cards.deck.length && !cards.known) newDeck();
    const total = cards.deck.length + cards.known;
    const card = cards.deck[0];
    const chips = ['All', ...UNITS].map((u) => `<button type="button" class="chip" data-unit="${esc(u)}" aria-pressed="${cards.unit === u}">${esc(u)}</button>`).join('');
    let face;
    if (!card) {
      face = `<div class="card done"><p class="card-kicker">Deck complete</p><p class="card-big">You recalled all ${total} ${cards.kind === 'defs' ? 'definitions' : 'formulas'}.</p><button type="button" class="primary" id="restart">Shuffle and start again</button></div>`;
    } else {
      const front = card.def
        ? (cards.dir === 'name'
          ? `<p class="card-big">${rich(card.name)}</p><p class="card-hint">Define this term in your own words, then reveal.</p>`
          : `<p class="card-def">${rich(card.note)}</p><p class="card-hint">Name the term being defined.</p>`)
        : (cards.dir === 'name'
          ? `<p class="card-big">${esc(card.name)}</p><p class="card-hint">Write the formula, then reveal.</p>`
          : `<div class="card-math">${tex(card.tex, true)}</div><p class="card-hint">Name this formula and say what it tells you.</p>`);
      const back = card.def
        ? `<p class="card-big small">${rich(card.name)}</p><p class="card-def">${rich(card.note)}</p>`
        : `<div class="card-math">${tex(card.tex, true)}</div><p class="card-big small">${esc(card.name)}</p><p class="eq-note">${esc(card.note)}</p>`;
      face = `<div class="card${cards.flipped ? ' flipped' : ''}">
        <p class="card-kicker">${esc(card.topic.unit)} <span aria-hidden="true">·</span> <a href="#${card.topic.id}">${esc(card.topic.title)}</a></p>
        ${cards.flipped ? back : front}
      </div>
      <div class="card-actions">
        ${cards.flipped
          ? `<button type="button" class="ghost-btn" id="again">Again <kbd>1</kbd></button><button type="button" class="primary" id="got">Got it <kbd>2</kbd></button>`
          : `<button type="button" class="primary" id="flip">Reveal answer <kbd>Space</kbd></button>`}
      </div>`;
    }
    main.innerHTML = `
      <article class="cards">
        <header class="topic-head">
          <p class="eyebrow">Practice</p>
          <h1>Flashcards</h1>
          <p class="lede">Test recall of every formula or definition. Cards you miss go to the back of the deck.</p>
        </header>
        <div class="card-bar">
          <div class="seg" role="group" aria-label="Deck">
            <button type="button" data-kind="formulas" aria-pressed="${cards.kind === 'formulas'}">Formulas</button>
            <button type="button" data-kind="defs" aria-pressed="${cards.kind === 'defs'}">Definitions</button>
          </div>
          <div class="seg" role="group" aria-label="Card direction">
            <button type="button" data-dir="name" aria-pressed="${cards.dir === 'name'}">${cards.kind === 'defs' ? 'Term → definition' : 'Name → formula'}</button>
            <button type="button" data-dir="tex" aria-pressed="${cards.dir === 'tex'}">${cards.kind === 'defs' ? 'Definition → term' : 'Formula → name'}</button>
          </div>
          <div class="chips" role="group" aria-label="Unit">${chips}</div>
        </div>
        <div class="card-meter"><span>${cards.known} of ${total} recalled</span><div class="bar"><i style="width:${total ? (cards.known / total) * 100 : 0}%"></i></div></div>
        ${face}
      </article>`;

    main.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => { cards.unit = b.dataset.unit; newDeck(); renderCards(); }));
    main.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { cards.kind = b.dataset.kind; newDeck(); renderCards(); }));
    main.querySelectorAll('[data-dir]').forEach((b) => b.addEventListener('click', () => { cards.dir = b.dataset.dir; cards.flipped = false; renderCards(); }));
    $('#flip')?.addEventListener('click', flip);
    $('#again')?.addEventListener('click', again);
    $('#got')?.addEventListener('click', got);
    $('#restart')?.addEventListener('click', () => { newDeck(); renderCards(); });
  }
  const flip = () => { cards.flipped = true; renderCards(); $('#got')?.focus(); };
  const again = () => { cards.deck.push(cards.deck.shift()); cards.flipped = false; renderCards(); $('#flip')?.focus(); };
  const got = () => { cards.deck.shift(); cards.known++; cards.flipped = false; renderCards(); ($('#flip') || $('#restart'))?.focus(); };

  document.addEventListener('keydown', (e) => {
    if (currentMode !== 'cards' || e.target.matches('input, textarea') || !cards.deck.length) return;
    if (e.key === ' ' && !cards.flipped && !e.target.matches('button')) { e.preventDefault(); flip(); }
    else if (e.key === '1' && cards.flipped) again();
    else if (e.key === '2' && cards.flipped) got();
  });

  /* ── Routing ── */
  let currentMode = 'graphs';
  function route() {
    const h = location.hash.slice(1);
    const mode = h === 'formulas' ? 'sheet' : h === 'flashcards' ? 'cards'
      : h === 'glossary' || h.startsWith('g-') ? 'glossary'
      : h === 'worked' || WORKED.some((w) => w.id === h) ? 'worked'
      : h === 'quiz' || h.startsWith('q-') ? 'quiz'
      : h === 'revise' || SHEETS.some((sh) => sh.id === h) ? 'revise' : 'graphs';
    currentMode = mode;
    document.querySelectorAll('.modes a').forEach((a) => a.setAttribute('aria-current', a.dataset.mode === mode ? 'page' : 'false'));
    document.body.classList.remove('nav-open');
    window.scrollTo(0, 0);
    if (mode === 'sheet') { renderNav(null); renderSheet(); }
    else if (mode === 'glossary') { renderNav(null); renderGlossary(h.startsWith('g-') ? h : null); }
    else if (mode === 'worked') { renderNav(null); renderWorked(h === 'worked' ? null : h); }
    else if (mode === 'revise') { renderNav(null); renderRevise(h === 'revise' ? null : h); }
    else if (mode === 'quiz') {
      renderNav(null);
      if (h.startsWith('q-')) {
        // Drill one worked answer: three fresh versions (or all its concept questions).
        const id = h.slice(2), items = QUIZ_ITEMS.filter((it) => it.worked === id);
        if (items.length) startQuiz(items, items.some((it) => it.kind === 'calc') ? 3 : items.length, workedById[id]?.title || 'this question');
        try { history.replaceState(null, '', '#quiz'); } catch (e) { /* sandboxed frame: keep the drill hash */ }
      }
      renderQuiz();
    }
    else if (mode === 'cards') { renderNav(null); renderCards(); }
    else {
      const t = byId[h] || byId[store.get('mn-last', '')] || TOPICS[0];
      store.set('mn-last', t.id);
      renderNav(t.id);
      renderTopic(t);
      $('.modes a[data-mode=graphs]').setAttribute('href', '#' + t.id);
    }
  }

  $('#search').addEventListener('input', (e) => {
    query = e.target.value.trim();
    const active = currentMode === 'graphs' ? (location.hash.slice(1) || store.get('mn-last', '')) : null;
    renderNav(active);
    const f = currentMode === 'sheet' ? $('#sheet-filter') : currentMode === 'glossary' ? $('#gl-filter') : null;
    if (f) { f.value = query; f.dispatchEvent(new Event('input')); }
  });
  $('#menu-btn').addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    $('#menu-btn').setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) document.body.classList.remove('nav-open'); });
  window.addEventListener('hashchange', route);
  renderProgress();
  route();
})();
