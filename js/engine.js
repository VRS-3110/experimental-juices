/* Graph engine: turns a topic's draw() primitives into an SVG string.
   Coordinates in primitives are in data units; the engine maps them to the plot box. */
(function () {
  const W = 560, H = 400;
  const M = { l: 58, r: 26, t: 22, b: 50 };
  const PW = W - M.l - M.r, PH = H - M.t - M.b;
  const SAMPLES = 200;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const n = (v) => (Math.round(v * 10) / 10).toString();

  let clipSeq = 0;

  function renderGraph(spec, state) {
    const [x0, x1] = spec.x.range;
    const [y0, y1] = spec.y.range;
    const sx = (x) => M.l + ((x - x0) / (x1 - x0)) * PW;
    const syRaw = (y) => M.t + PH - ((y - y0) / (y1 - y0)) * PH;
    // Clamp far-off values so SVG coordinates stay sane; the clip path hides the overflow.
    const sy = (y) => syRaw(Math.max(y0 - (y1 - y0) * 3, Math.min(y1 + (y1 - y0) * 3, y)));
    const eps = 1e-9;
    const inBox = (x, y) => x >= x0 - eps && x <= x1 + eps && y >= y0 - eps && y <= y1 + eps;
    const clipId = 'plot-clip-' + ++clipSeq;

    const L = { area: [], grid: [], axes: [], curve: [], guide: [], point: [], label: [] };

    // Grid: ten divisions each way, like graph paper.
    for (let i = 0; i <= 10; i++) {
      const gx = M.l + (PW * i) / 10, gy = M.t + (PH * i) / 10;
      L.grid.push(`<line class="grid" x1="${n(gx)}" y1="${M.t}" x2="${n(gx)}" y2="${M.t + PH}"/>`);
      L.grid.push(`<line class="grid" x1="${M.l}" y1="${n(gy)}" x2="${M.l + PW}" y2="${n(gy)}"/>`);
    }

    // Axes and titles.
    L.axes.push(`<line class="axis" x1="${M.l}" y1="${M.t + PH}" x2="${M.l + PW}" y2="${M.t + PH}"/>`);
    L.axes.push(`<line class="axis" x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${M.t + PH}"/>`);
    L.axes.push(`<text class="axis-title" x="${M.l + PW / 2}" y="${H - 10}" text-anchor="middle">${esc(spec.x.label)}</text>`);
    L.axes.push(`<text class="axis-title" x="16" y="${M.t + PH / 2}" text-anchor="middle" transform="rotate(-90 16 ${M.t + PH / 2})">${esc(spec.y.label)}</text>`);
    const fx = spec.x.fmt || ((v) => v), fy = spec.y.fmt || ((v) => v);
    (spec.x.ticks || []).forEach((v) => {
      L.axes.push(`<line class="axis" x1="${n(sx(v))}" y1="${M.t + PH}" x2="${n(sx(v))}" y2="${M.t + PH + 5}"/>`);
      L.axes.push(`<text class="tick" x="${n(sx(v))}" y="${M.t + PH + 18}" text-anchor="middle">${esc(fx(v))}</text>`);
    });
    (spec.y.ticks || []).forEach((v) => {
      L.axes.push(`<line class="axis" x1="${M.l - 5}" y1="${n(syRaw(v))}" x2="${M.l}" y2="${n(syRaw(v))}"/>`);
      L.axes.push(`<text class="tick" x="${M.l - 8}" y="${n(syRaw(v) + 4)}" text-anchor="end">${esc(fy(v))}</text>`);
    });

    const curveLabel = (x, y, text, k) => {
      const px = sx(x), py = sy(y);
      const nearRight = px > W - M.r - 70;
      const ax = nearRight ? px - 8 : px + 8;
      const ay = Math.max(M.t + 12, Math.min(M.t + PH - 6, py - 7));
      L.label.push(`<text class="clabel t-${k}" x="${n(ax)}" y="${n(ay)}" text-anchor="${nearRight ? 'end' : 'start'}">${esc(text)}</text>`);
    };

    const items = spec.draw(state).filter(Boolean);
    for (const it of items) {
      const k = it.k || 'n';
      const dash = it.dash || k === 'ghost' ? ' dashed' : '';
      switch (it.t) {
        case 'curve': {
          const from = it.from ?? x0, to = it.to ?? x1;
          let d = '', pen = false, lastIn = null;
          for (let i = 0; i <= SAMPLES; i++) {
            const x = from + ((to - from) * i) / SAMPLES;
            const y = it.fn(x);
            if (!Number.isFinite(y)) { pen = false; continue; }
            d += (pen ? 'L' : 'M') + n(sx(x)) + ' ' + n(sy(y));
            pen = true;
            if (inBox(x, y) && y > y0 + (y1 - y0) * 0.02) lastIn = [x, y];
          }
          L.curve.push(`<path class="curve k-${k}${dash}" d="${d}" clip-path="url(#${clipId})"/>`);
          if (it.label) {
            if (it.labelAt != null) curveLabel(it.labelAt, it.fn(it.labelAt), it.label, k);
            else if (lastIn) curveLabel(lastIn[0], lastIn[1], it.label, k);
          }
          break;
        }
        case 'vline': {
          if (it.x < x0 || it.x > x1) break;
          L.curve.push(`<line class="curve k-${k}${dash}" x1="${n(sx(it.x))}" y1="${M.t}" x2="${n(sx(it.x))}" y2="${M.t + PH}"/>`);
          if (it.label) L.label.push(`<text class="clabel t-${k}" x="${n(sx(it.x) + 7)}" y="${M.t + 14}">${esc(it.label)}</text>`);
          break;
        }
        case 'hline': {
          if (it.y < y0 || it.y > y1) break;
          L.curve.push(`<line class="curve k-${k}${dash}" x1="${M.l}" y1="${n(sy(it.y))}" x2="${M.l + PW}" y2="${n(sy(it.y))}"/>`);
          if (it.label) L.label.push(`<text class="clabel t-${k}" x="${it.labelLeft ? M.l + 6 : M.l + PW - 6}" y="${n(sy(it.y) - 7)}" text-anchor="${it.labelLeft ? 'start' : 'end'}">${esc(it.label)}</text>`);
          break;
        }
        case 'seg': {
          L.curve.push(`<line class="curve k-${k}${dash}${it.bold ? ' bold' : ''}" x1="${n(sx(it.x1))}" y1="${n(sy(it.y1))}" x2="${n(sx(it.x2))}" y2="${n(sy(it.y2))}" clip-path="url(#${clipId})"/>`);
          if (it.label) {
            const mx = (it.x1 + it.x2) / 2, my = (it.y1 + it.y2) / 2;
            if (inBox(mx, my)) L.label.push(`<text class="clabel t-${k}" x="${n(sx(mx))}" y="${n(sy(my) + (it.below ? 20 : -9))}" text-anchor="middle">${esc(it.label)}</text>`);
          }
          break;
        }
        case 'area': {
          const pts = it.pts.filter((p) => p.every(Number.isFinite));
          if (pts.length < 3) break;
          L.area.push(`<polygon class="f-${k}" points="${pts.map((p) => n(sx(p[0])) + ',' + n(sy(p[1]))).join(' ')}" clip-path="url(#${clipId})"/>`);
          if (it.label) {
            const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
            const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
            if (inBox(cx, cy)) L.label.push(`<text class="alabel t-${k}" x="${n(sx(cx))}" y="${n(sy(cy) + 4)}" text-anchor="middle">${esc(it.label)}</text>`);
          }
          break;
        }
        case 'guide': {
          if (!inBox(it.x, it.y)) break;
          const px = sx(it.x), py = sy(it.y);
          L.guide.push(`<path class="guide k-${k}" d="M${n(px)} ${M.t + PH}V${n(py)}${it.yl !== null ? 'H' + M.l : ''}"/>`);
          if (it.xl) L.guide.push(`<text class="gtick t-${k}" x="${n(px)}" y="${M.t + PH + 18}" text-anchor="middle">${esc(it.xl)}</text>`);
          if (it.yl) L.guide.push(`<text class="gtick t-${k}" x="${M.l - 8}" y="${n(py + 4)}" text-anchor="end">${esc(it.yl)}</text>`);
          break;
        }
        case 'point': {
          if (!inBox(it.x, it.y)) break;
          L.point.push(`<circle class="pt p-${k}" cx="${n(sx(it.x))}" cy="${n(sy(it.y))}" r="${it.small ? 3.5 : 5}"/>`);
          if (it.label) {
            const dx = it.dx ?? 9, dy = it.dy ?? -9;
            L.label.push(`<text class="plabel t-${k}" x="${n(sx(it.x) + dx)}" y="${n(sy(it.y) + dy)}" text-anchor="${dx < 0 ? 'end' : 'start'}">${esc(it.label)}</text>`);
          }
          break;
        }
        case 'text': {
          if (!inBox(it.x, it.y)) break;
          L.label.push(`<text class="note t-${k}" x="${n(sx(it.x))}" y="${n(sy(it.y))}" text-anchor="${it.anchor || 'start'}">${esc(it.text)}</text>`);
          break;
        }
      }
    }

    return `<svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.aria || '')}">
      <defs><clipPath id="${clipId}"><rect x="${M.l}" y="${M.t}" width="${PW}" height="${PH}"/></clipPath></defs>
      <rect class="plot-bg" x="${M.l}" y="${M.t}" width="${PW}" height="${PH}"/>
      ${L.grid.join('')}${L.area.join('')}${L.axes.join('')}${L.guide.join('')}${L.curve.join('')}${L.point.join('')}${L.label.join('')}
    </svg>`;
  }

  window.renderGraph = renderGraph;
})();
