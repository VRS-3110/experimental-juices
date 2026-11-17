/* Imperfect labour markets (Block 9): monopsony, and bilateral monopoly (a monopsony employer
   facing a union). Loads after oligopoly.js and inserts both topics after the labour-market topic. */
(function () {
  const { R, f, money, pct, C, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
  const MICRO = 'Microeconomics';

  // Shared model: labour supply w = 2 + bL, so MFC = 2 + 2bL. Labour demand MRP_L = 20 − 0.5L.
  const W0 = 2, MA = 20, MD = 0.5;
  const supply = (b) => (L) => W0 + b * L;
  const mfc = (b) => (L) => W0 + 2 * b * L;
  const mrp = (L) => MA - MD * L;
  const base = (b) => {
    const Lc = (MA - W0) / (b + MD), wc = W0 + b * Lc;          // competitive: S = MRP
    const Lm = (MA - W0) / (2 * b + MD), wm = W0 + b * Lm;      // monopsony: MFC = MRP, wage from S
    const Lu = (MA - W0) / (b + 2 * MD), wu = mrp(Lu);          // union: MR of labour demand = S
    return { Lc, wc, Lm, wm, mrpM: mrp(Lm), Lu, wu };
  };
  // Employment when a wage floor w (minimum wage or negotiated wage) faces a monopsony employer:
  // MFC is flat at w until the supply curve reaches w, then jumps to the ordinary MFC.
  const atWage = (b, w) => {
    const z = base(b);
    if (w <= z.wm + 1e-9) return { L: z.Lm, w: z.wm, regime: 'none' };
    const Ls = (w - W0) / b, Ld = (MA - w) / MD;
    return Ls <= Ld ? { L: Ls, w, regime: 'supply', Ls, Ld } : { L: Ld, w, regime: 'demand', Ls, Ld };
  };
  // DWL against the competitive outcome: area between MRP and supply from L to L_c.
  const dwl = (b, L) => { const z = base(b); return 0.5 * (mrp(L) - (W0 + b * L)) * (z.Lc - L); };
  // MFC curve faced under a wage floor w: flat at w up to L_s(w), then the ordinary MFC.
  const floorMfc = (b, w) => (L) => (L <= (w - W0) / b ? w : W0 + 2 * b * L);

  /* ── Monopsony ── */
  const monopsony = {
    id: 'monopsony',
    title: 'Monopsony in the labour market',
    summary: 'A monopsony is a single buyer: here, one employer hiring in a local labour market. To hire one more worker it must raise the wage for everyone, so the marginal factor cost (MFC) of labour lies above the supply curve. It hires where MRP = MFC and pays only the wage on the supply curve, so it employs fewer workers at a lower wage than a competitive market would. A minimum wage can then raise both wages and employment.',
    model: 'Labour supply w = 2 + bL, so total wage bill wL = 2L + bL² and MFC = 2 + 2bL. Labour demand (marginal revenue product) MRP_L = 20 − 0.5L. A flatter supply curve (smaller b) means workers have better outside options and the employer has less power.',
    graph: {
      x: { range: [0, 40], label: 'Workers (L)', ticks: range(0, 40, 5) },
      y: { range: [0, 24], label: 'Wage and MRP ($)', ticks: range(0, 24, 4) },
      params: [
        { id: 'b', label: 'Slope of labour supply (b)', min: 0.1, max: 1.5, step: 0.05, value: 0.5, hint: 'smaller = more elastic supply' },
        { id: 'mw', label: 'Minimum wage (0 = none)', min: 0, max: 19.5, step: 0.5, value: 0 },
      ],
      draw(s) {
        const z = base(s.b), o = atWage(s.b, s.mw), binding = o.regime !== 'none', out = [];
        if (z.Lc - o.L > 0.3) out.push(A([[o.L, mrp(o.L)], [z.Lc, z.wc], [o.L, W0 + s.b * o.L]], 'r', z.Lc - o.L > 3 ? 'DWL' : ''));
        out.push(
          C(mrp, 'd', 'MRP = D_L', { to: 40, labelAt: 28 }),
          C(supply(s.b), 'g', 'S_L (wage)', { to: Math.min(40, (24 - W0) / s.b), labelAt: Math.min(34, (21 - W0) / s.b) }),
          C(mfc(s.b), 's', 'MFC', { to: Math.min(40, (24 - W0) / (2 * s.b)), labelAt: Math.min(30, (22 - W0) / (2 * s.b)) }),
        );
        if (binding) {
          const Ls = (s.mw - W0) / s.b;
          out.push(Hl(s.mw, 'o', 'Minimum wage', { dash: true, labelLeft: true }));
          out.push(C(floorMfc(s.b, s.mw), 'o', '', { to: Math.min(40, Ls), bold: true }));
          if (Ls < 40) out.push(S(Ls, s.mw, Ls, W0 + 2 * s.b * Ls, 'o', '', { dash: true }));
        }
        out.push(P(z.Lc, z.wc, 'Competitive', 'n', { small: true, dx: 9, dy: -8 }));
        if (!binding) {
          out.push(
            S(z.Lm, z.wm, z.Lm, z.mrpM, 'r', '', { dash: true }),
            P(z.Lm, z.mrpM, 'MFC = MRP', 'n', { small: true, dx: -9, dy: -8 }),
            G(z.Lm, z.wm, 'L_m', 'w_m'),
            P(z.Lm, z.wm, 'Monopsony', 'o', { dx: 9, dy: 16 }),
          );
        } else {
          out.push(G(o.L, o.w, 'L', null), P(o.L, o.w, 'Employer hires', 'o', { dx: 9, dy: 18 }));
        }
        return out;
      },
      readout(s) {
        const z = base(s.b), o = atWage(s.b, s.mw), binding = o.regime !== 'none';
        const rows = [
          ['Employment / wage', `${f(o.L)} / ${money(o.w)}`],
          ['MRP of the last worker', money(mrp(o.L))],
          ['Gap between MRP and wage', money(mrp(o.L) - o.w)],
          ['Rate of exploitation (MRP − w)/w', pct((100 * (mrp(o.L) - o.w)) / o.w)],
          ['Competitive employment / wage', `${f(z.Lc)} / ${money(z.wc)}`],
          ['Deadweight loss', money(Math.max(0, dwl(s.b, o.L)))],
        ];
        let status, tone;
        if (!binding) {
          status = s.mw > 0
            ? `The minimum wage (${money(s.mw)}) is at or below the monopsony wage (${money(z.wm)}), so it has no effect.`
            : `The monopsonist hires ${f(z.Lm)} workers, where MFC = MRP, and pays only ${money(z.wm)}, read off the supply curve. That is ${f(z.Lc - z.Lm)} fewer workers and ${money(z.wc - z.wm)} less pay than a competitive market.`;
          tone = s.mw > 0 ? 'info' : 'warn';
        } else if (o.regime === 'supply') {
          status = `The minimum wage makes MFC flat at ${money(s.mw)} up to the supply curve, so the employer hires everyone willing to work at that wage: employment rises from ${f(z.Lm)} to ${f(o.L)}, and the wage rises too.`;
          tone = 'good';
        } else if (o.L >= z.Lm - 1e-9) {
          status = `Above the competitive wage (${money(z.wc)}), employment is set by the MRP curve and starts to fall, but at ${f(o.L)} it is still above the monopsony level (${f(z.Lm)}).`;
          tone = 'info';
        } else {
          status = `The minimum wage is above ${money(z.mrpM)}, the MRP at the monopsony employment, so employment (${f(o.L)}) is now below even the monopsony level.`;
          tone = 'warn';
        }
        return { rows, status, tone };
      },
    },
    equations: [
      { name: 'Marginal factor cost', tex: R`MFC = \frac{\Delta (wL)}{\Delta L} = w + L\,\frac{\Delta w}{\Delta L} > w`, note: 'Hiring one more worker means paying the higher wage to everyone already employed.' },
      { name: 'Linear supply', tex: R`w = c + bL \;\Rightarrow\; MFC = c + 2bL`, note: 'Same intercept as supply, twice the slope (like MR and demand).' },
      { name: 'Monopsony hiring rule', tex: R`MRP_L = MFC \;\Rightarrow\; L_m,\qquad w_m = c + b\,L_m < MRP_L(L_m)`, note: 'Employment from MFC = MRP; the wage is read off the supply curve below that point.' },
      { name: 'Rate of exploitation (Pigou)', tex: R`\frac{MRP_L - w}{w}`, note: 'Zero in a competitive labour market; larger when labour supply is less elastic.' },
      { name: 'Minimum wage between w_m and w_c', tex: R`MFC = w_{min} \text{ up to the supply curve} \;\Rightarrow\; L = L_S(w_{min}) > L_m`, note: 'Employment is highest when the minimum wage equals the competitive wage.' },
    ],
    points: [
      'Sources of monopsony power: one dominant employer in a town, specialised skills with few buyers (nurses and the NHS, professional athletes), and costs of moving or searching for jobs that make labour supply to one firm upward-sloping.',
      'Compared with competition, monopsony gives lower employment, a lower wage, a gap between MRP and the wage, and a deadweight loss.',
      'A minimum wage between the monopsony and competitive wages raises both pay and employment. Up to the MRP at the monopsony employment it still leaves employment at least as high as under monopsony; above that it reduces it.',
      'This is why empirical studies (for example Card and Krueger on fast-food jobs) can find small or positive employment effects of minimum wages.',
      'Oligopsony (a few buyers) gives similar but weaker effects.',
    ],
    tip: 'Draw S, MFC (twice as steep, same intercept) and MRP. Mark employment where MFC = MRP, then drop down to the supply curve for the wage: the wage is not where MFC meets MRP. For a minimum wage, redraw MFC as flat at the minimum wage up to the supply curve.',
  };

  /* ── Bilateral monopoly ── */
  const bilateral = (s) => {
    const z = base(s.b), w = z.wm + s.beta * (z.wu - z.wm), o = atWage(s.b, w);
    return { ...z, w, o };
  };
  const bilateralMonopoly = {
    id: 'bilateral-monopoly',
    title: 'Bilateral monopoly: union and monopsony employer',
    summary: 'In a bilateral monopoly a single seller faces a single buyer. In the labour market this is a trade union, the only seller of labour, bargaining with a monopsony employer. The employer wants the monopsony wage; the union, acting like a monopolist, wants a higher wage. Economics cannot say where the wage settles: that depends on bargaining power. But a union facing a monopsonist can raise both wages and employment.',
    model: 'Same market as the monopsony topic: labour supply w = 2 + bL, MFC = 2 + 2bL, MRP_L = 20 − 0.5L. The union treats labour demand (MRP) as its demand curve, so its marginal revenue is MR_U = 20 − L, and it prefers the employment where MR_U = supply, at the wage on the MRP curve. Bargaining power β sets the agreed wage between the two preferred wages; the employer then hires where the agreed wage meets supply or MRP, whichever gives fewer workers.',
    graph: {
      x: { range: [0, 40], label: 'Workers (L)', ticks: range(0, 40, 5) },
      y: { range: [0, 24], label: 'Wage and MRP ($)', ticks: range(0, 24, 4) },
      params: [
        { id: 'beta', label: 'Union bargaining power (β)', min: 0, max: 1, step: 0.01, value: 0.5, hint: '0 = employer sets the wage, 1 = union sets it' },
        { id: 'b', label: 'Slope of labour supply (b)', min: 0.1, max: 1.5, step: 0.05, value: 0.5 },
      ],
      draw(s) {
        const z = bilateral(s), o = z.o;
        return [
          C(mrp, 'd', 'MRP = D_L', { to: 40, labelAt: 28 }),
          C((L) => MA - 2 * MD * L, 'n', 'MR (union)', { to: 20, dash: true, labelAt: 17 }),
          C(supply(s.b), 'g', 'S_L', { to: Math.min(40, (24 - W0) / s.b), labelAt: Math.min(34, (21 - W0) / s.b) }),
          C(mfc(s.b), 's', 'MFC', { to: Math.min(40, (24 - W0) / (2 * s.b)), labelAt: Math.min(30, (22 - W0) / (2 * s.b)) }),
          Hl(z.wu, 'ghost', 'Union’s wage'),
          Hl(z.wm, 'ghost', 'Employer’s wage'),
          S(0, z.w, o.L, z.w, 'o', '', { dash: true }),
          P(z.Lc, z.wc, 'Competitive', 'n', { small: true, dx: 9, dy: -8 }),
          P(z.Lm, z.wm, 'E', 'n', { small: true, dx: -16, dy: 16 }),
          P(z.Lu, z.wu, 'U', 'n', { small: true, dx: -10, dy: 5 }),
          G(o.L, z.w, 'L', 'w'),
          P(o.L, z.w, ''),
          T(0.6, z.w + 0.5, 'Agreed wage', 'o'),
        ];
      },
      readout(s) {
        const z = bilateral(s), o = z.o;
        let status, tone;
        if (s.beta < 0.005) { status = `The employer has all the power: it pays the monopsony wage ${money(z.wm)} and hires ${f(z.Lm)}.`; tone = 'warn'; }
        else if (s.beta > 0.995) { status = `The union has all the power: it sets ${money(z.wu)}, the wage where its MR equals the supply price, and employment is ${f(o.L)}.`; tone = 'info'; }
        else if (o.L > z.Lm + 1e-6 && o.regime === 'supply') { status = `The agreed wage is between the monopsony and competitive wages, so the union has raised both pay and employment (${f(o.L)} against ${f(z.Lm)}): countervailing power.`; tone = 'good'; }
        else if (o.L > z.Lm + 1e-6) { status = `The agreed wage is above the competitive wage, so the employer moves up its MRP curve; employment (${f(o.L)}) is below the competitive level but still above the monopsony level.`; tone = 'info'; }
        else { status = `The agreed wage is high enough that the employer cuts hiring to ${f(o.L)}, no more than under monopsony.`; tone = 'warn'; }
        return {
          rows: [
            ['Employer’s preferred wage (monopsony)', `${money(z.wm)} with L = ${f(z.Lm)}`],
            ['Union’s preferred wage', `${money(z.wu)} with L = ${f(z.Lu)}`],
            ['Agreed wage', money(z.w)],
            ['Employment at the agreed wage', f(o.L)],
            ['Competitive wage / employment', `${money(z.wc)} / ${f(z.Lc)}`],
            ['Deadweight loss', money(Math.max(0, dwl(s.b, o.L)))],
          ],
          status, tone,
        };
      },
    },
    equations: [
      { name: 'Employer’s preferred outcome', tex: R`MRP_L = MFC \;\Rightarrow\; L_m,\qquad w_m \text{ from supply}`, note: 'The monopsony solution.' },
      { name: 'Union’s preferred outcome', tex: R`MR_U = MC_U \;(\text{the supply price}) \;\Rightarrow\; L_U,\qquad w_U \text{ from MRP}`, note: 'The union acts as a monopoly seller facing the employer’s labour demand.' },
      { name: 'Range of the bargain', tex: R`w_m \le w \le w_U`, note: 'Where the wage settles depends on bargaining power, not on supply and demand.' },
      { name: 'Employment at an agreed wage', tex: R`L = \min\{L_S(w),\; L_D(w)\}`, note: 'Up to the competitive wage employment follows supply and rises; above it, employment follows MRP and falls.' },
    ],
    points: [
      'The outcome is indeterminate: economic theory gives the range of possible wages, and bargaining strength (strike funds, the employer’s profits, unemployment, law on industrial action) decides the point.',
      'Countervailing power (Galbraith): a union facing a monopsony can offset the employer’s power, pushing the wage up toward the competitive level and raising employment at the same time.',
      'Compare with a union in a competitive labour market, which can raise the wage only by cutting employment.',
      'Both sides may prefer the competitive wage to a long dispute: strikes and lockouts impose losses on each side.',
      'Other examples: a single supplier selling a specialised component to a single buyer; a national health service buying drugs from a patent-holding firm.',
    ],
    tip: 'Draw S, MFC and MRP, plus the union’s MR curve from the MRP. Mark the employer’s point (MFC = MRP, wage on S) and the union’s point (MR = S, wage on MRP); the wage lies between them. State that the result depends on bargaining power, and show that a wage up to the competitive level raises employment.',
  };

  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  const block = (window.TOPICS.find((t) => t.id === 'labour-market') || {}).block || 'Block 9';
  insertAfter('labour-market', monopsony, MICRO, block);
  insertAfter('monopsony', bilateralMonopoly, MICRO, block);
})();
