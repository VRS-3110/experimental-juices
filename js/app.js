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
      : h === 'worked' || WORKED.some((w) => w.id === h) ? 'worked' : 'graphs';
    currentMode = mode;
    document.querySelectorAll('.modes a').forEach((a) => a.setAttribute('aria-current', a.dataset.mode === mode ? 'page' : 'false'));
    document.body.classList.remove('nav-open');
    window.scrollTo(0, 0);
    if (mode === 'sheet') { renderNav(null); renderSheet(); }
    else if (mode === 'glossary') { renderNav(null); renderGlossary(h.startsWith('g-') ? h : null); }
    else if (mode === 'worked') { renderNav(null); renderWorked(h === 'worked' ? null : h); }
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
