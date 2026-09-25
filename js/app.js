(function () {
  const TOPICS = window.TOPICS;
  const UNITS = [...new Set(TOPICS.map((t) => t.unit))];
  const byId = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
  const stateFor = (t) => (sliderState[t.id] ||= Object.fromEntries(t.graph.params.map((p) => [p.id, p.value])));
  let query = '';

  const main = $('#main');
  const nav = $('#topic-nav');

  /* ── Sidebar ── */
  function matches(t, q) {
    if (!q) return true;
    const hay = [t.title, t.unit, t.summary, ...t.equations.map((e) => e.name)].join(' ').toLowerCase();
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
          <span>${esc(t.title)}</span></a></li>`;
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
    const s = stateFor(t);
    const controls = t.graph.params.map((p) => `
      <div class="ctrl">
        <label for="p-${t.id}-${p.id}"><span>${esc(p.label)}</span><output id="o-${t.id}-${p.id}">${fmtParam(p, s[p.id])}</output></label>
        <input type="range" id="p-${t.id}-${p.id}" data-param="${p.id}" min="${p.min}" max="${p.max}" step="${p.step}" value="${s[p.id]}">
        ${p.hint ? `<small>${esc(p.hint)}</small>` : ''}
      </div>`).join('');

    main.innerHTML = `
      <article class="topic">
        <header class="topic-head">
          <p class="eyebrow">${esc(t.unit)} <span aria-hidden="true">·</span> Topic ${idx + 1} of ${TOPICS.length}</p>
          <h1>${esc(t.title)}</h1>
          <p class="lede">${esc(t.summary)}</p>
          <button type="button" class="master-toggle" id="master-toggle" aria-pressed="${mastered.has(t.id)}">
            <span class="box" aria-hidden="true"></span><span class="lbl">${mastered.has(t.id) ? 'Mastered' : 'Mark as mastered'}</span>
          </button>
        </header>
        <div class="bench">
          <section class="panel graph-panel" aria-label="Interactive graph">
            <div class="graph-wrap" id="graph"></div>
            <p class="model"><span>Model</span> ${esc(t.model)}</p>
            <div class="controls">${controls}</div>
            <div class="readout-wrap">
              <dl class="readout" id="readout"></dl>
              <p class="status" id="status" hidden></p>
            </div>
            <button type="button" class="ghost-btn" id="reset">Reset sliders</button>
          </section>
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
        <nav class="pager" aria-label="Topic navigation">
          ${prev ? `<a href="#${prev.id}" class="pager-link"><small>Previous</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}
          ${next ? `<a href="#${next.id}" class="pager-link next"><small>Next</small><span>${esc(next.title)}</span></a>` : '<span></span>'}
        </nav>
      </article>`;

    const draw = () => {
      $('#graph').innerHTML = window.renderGraph({ ...t.graph, aria: t.title + ' graph' }, s);
      const r = t.graph.readout(s);
      $('#readout').innerHTML = r.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
      const st = $('#status');
      st.hidden = !r.status;
      st.textContent = r.status || '';
      st.dataset.tone = r.tone || 'info';
    };
    draw();

    main.querySelectorAll('input[type=range]').forEach((inp) => {
      inp.addEventListener('input', () => {
        const p = t.graph.params.find((x) => x.id === inp.dataset.param);
        s[p.id] = parseFloat(inp.value);
        $(`#o-${t.id}-${p.id}`).textContent = fmtParam(p, s[p.id]);
        draw();
      });
    });
    $('#reset').addEventListener('click', () => {
      t.graph.params.forEach((p) => { s[p.id] = p.value; $(`#p-${t.id}-${p.id}`).value = p.value; $(`#o-${t.id}-${p.id}`).textContent = fmtParam(p, p.value); });
      draw();
    });
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

  function fmtParam(p, v) {
    const decimals = (String(p.step).split('.')[1] || '').length;
    return Number(v).toFixed(decimals);
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

  /* ── Flashcards ── */
  const allCards = TOPICS.flatMap((t) => t.equations.map((e) => ({ ...e, topic: t })));
  const cards = { unit: 'All', dir: 'name', deck: [], known: 0, flipped: false };

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function newDeck() {
    cards.deck = shuffle(allCards.filter((c) => cards.unit === 'All' || c.topic.unit === cards.unit));
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
      face = `<div class="card done"><p class="card-kicker">Deck complete</p><p class="card-big">You recalled all ${total} formulas.</p><button type="button" class="primary" id="restart">Shuffle and start again</button></div>`;
    } else {
      const front = cards.dir === 'name'
        ? `<p class="card-big">${esc(card.name)}</p><p class="card-hint">Write the formula, then reveal.</p>`
        : `<div class="card-math">${tex(card.tex, true)}</div><p class="card-hint">Name this formula and say what it tells you.</p>`;
      const back = `<div class="card-math">${tex(card.tex, true)}</div><p class="card-big small">${esc(card.name)}</p><p class="eq-note">${esc(card.note)}</p>`;
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
          <p class="lede">Test recall of every formula. Cards you miss go to the back of the deck.</p>
        </header>
        <div class="card-bar">
          <div class="chips" role="group" aria-label="Unit">${chips}</div>
          <div class="seg" role="group" aria-label="Card direction">
            <button type="button" data-dir="name" aria-pressed="${cards.dir === 'name'}">Name → formula</button>
            <button type="button" data-dir="tex" aria-pressed="${cards.dir === 'tex'}">Formula → name</button>
          </div>
        </div>
        <div class="card-meter"><span>${cards.known} of ${total} recalled</span><div class="bar"><i style="width:${total ? (cards.known / total) * 100 : 0}%"></i></div></div>
        ${face}
      </article>`;

    main.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => { cards.unit = b.dataset.unit; newDeck(); renderCards(); }));
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
    const mode = h === 'formulas' ? 'sheet' : h === 'flashcards' ? 'cards' : 'graphs';
    currentMode = mode;
    document.querySelectorAll('.modes a').forEach((a) => a.setAttribute('aria-current', a.dataset.mode === mode ? 'page' : 'false'));
    document.body.classList.remove('nav-open');
    if (mode === 'sheet') { renderNav(null); renderSheet(); }
    else if (mode === 'cards') { renderNav(null); renderCards(); }
    else {
      const t = byId[h] || byId[store.get('mn-last', '')] || TOPICS[0];
      store.set('mn-last', t.id);
      renderNav(t.id);
      renderTopic(t);
      $('.modes a[data-mode=graphs]').setAttribute('href', '#' + t.id);
    }
    window.scrollTo(0, 0);
  }

  $('#search').addEventListener('input', (e) => {
    query = e.target.value.trim();
    const active = currentMode === 'graphs' ? (location.hash.slice(1) || store.get('mn-last', '')) : null;
    renderNav(active);
    if (currentMode === 'sheet') { const f = $('#sheet-filter'); if (f) { f.value = query; f.dispatchEvent(new Event('input')); } }
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
