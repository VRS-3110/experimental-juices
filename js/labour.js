/* Imperfect labour markets (Block 9): monopsony, and bilateral monopoly (a monopsony employer
   facing a union). Loads after oligopoly.js and inserts both topics after the labour-market topic. */
(function () {
  const { R, f, money, pct, C, V, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
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

  /* ── Wage differentials ── */
  // Two sectors share a fixed workforce of 40. Sector A (pleasant jobs): w_A = 20 − 0.5L_A.
  // Sector B (unpleasant or risky jobs): w_B = d_B − 0.5L_B. Workers need θ extra to accept B.
  // Free mobility: workers move until w_B − w_A = θ. With barriers they stay at 20 and 20.
  const NW = 40, DA = 20, DS = 0.5;
  const differentials = (s) => {
    const free = s.mob === 0;
    let LA = free ? NW + s.theta - s.dB : NW / 2;
    LA = Math.max(0, Math.min(NW, LA));
    const LB = NW - LA, wA = DA - DS * LA, wB = s.dB - DS * LB;
    return { free, LA, LB, wA, wB, gap: wB - wA, extra: wB - wA - s.theta };
  };
  const sourcesTable = `
    <h2>Why wages differ</h2>
    <p class="extra-lede">Equilibrium differentials persist even with free movement; disequilibrium differentials last only as long as something stops workers moving.</p>
    <div class="table-scroll"><table class="compare">
      <thead><tr><th>Source</th><th>How it raises or lowers pay</th><th>Type</th></tr></thead>
      <tbody>
        <tr><th>Compensating differentials</th><td>Danger, unpleasantness, unsocial hours or insecurity must be paid for to attract workers.</td><td>Equilibrium</td></tr>
        <tr><th>Human capital</th><td>Education and training raise productivity (MRP), so skilled labour earns more.</td><td>Equilibrium</td></tr>
        <tr><th>Ability and talent</th><td>Scarce natural ability earns economic rent (superstars).</td><td>Equilibrium</td></tr>
        <tr><th>Non-competing groups</th><td>Occupations needing skills few people have form separate markets with separate wages.</td><td>Equilibrium</td></tr>
        <tr><th>Occupational and geographical immobility</th><td>Retraining costs, housing costs and family ties slow the flow of workers to better-paid jobs.</td><td>Disequilibrium</td></tr>
        <tr><th>Barriers to entry</th><td>Licensing, closed shops and long qualifications restrict supply to an occupation.</td><td>Disequilibrium (while they last)</td></tr>
        <tr><th>Market power</th><td>Unions raise pay; monopsony employers hold it down.</td><td>Either</td></tr>
        <tr><th>Discrimination</th><td>Paying equally productive workers differently because of sex, ethnicity or age.</td><td>Either</td></tr>
        <tr><th>Efficiency wages</th><td>Firms pay above the market wage to cut turnover and raise effort.</td><td>Equilibrium</td></tr>
      </tbody>
    </table></div>`;
  const wageDifferentials = {
    id: 'wage-differentials',
    title: 'Wage differentials',
    summary: 'Wages differ across jobs for two kinds of reasons. Some differences are equilibrium (compensating) differentials: they persist even when workers can move freely, because jobs differ in danger, unpleasantness or the skill they need. Others are disequilibrium differentials: they exist only because something (immobility, licensing, discrimination) stops workers moving to the better-paid job. With free movement, workers shift until the only gap left is the compensating one.',
    model: 'A fixed workforce of 40 is split between sector A (pleasant jobs, labour demand w_A = 20 − 0.5L_A, measured from the left) and sector B (unpleasant or risky jobs, w_B = d_B − 0.5L_B, measured from the right). Workers need an extra θ to accept a job in B. With free movement they move until w_B − w_A = θ; with barriers they stay where they are (20 in each).',
    graph: {
      x: { range: [0, NW], label: 'Workers in A (from the left) · workers in B (from the right)', ticks: range(0, NW, 5) },
      y: { range: [0, 30], label: 'Wage ($)', ticks: range(0, 30, 5) },
      params: [
        { id: 'theta', label: 'Compensating differential for B (θ)', min: 0, max: 8, step: 0.5, value: 3 },
        { id: 'dB', label: 'Demand for labour in B (intercept d_B)', min: 14, max: 28, step: 0.5, value: 20 },
        { id: 'mob', label: 'Mobility between sectors', options: [{ v: 0, label: 'Free movement' }, { v: 1, label: 'Barriers (no movement)' }], value: 0 },
      ],
      valid(s) {
        const z = differentials(s);
        if (z.LA <= 0.5 || z.LB <= 0.5) return 'With these values every worker would want to be in one sector; the model needs both sectors to employ someone.';
        if (z.wA <= 0 || z.wB <= 0) return 'Wages must stay positive.';
        return true;
      },
      draw(s) {
        const z = differentials(s);
        const dA = (x) => DA - DS * x, dB = (x) => s.dB - DS * (NW - x);
        return [
          C(dA, 'd', 'D_A', { to: NW, labelAt: 3 }),
          C(dB, 's', 'D_B', { to: NW, labelAt: 34 }),
          s.theta > 0 ? C((x) => dB(x) - s.theta, 's', 'D_B − θ', { to: NW, dash: true, labelAt: 30 }) : null,
          V(z.LA, 'ghost', ''),
          S(z.LA, z.wA, z.LA, z.wB, 'o', '', { bold: true }),
          Math.abs(z.gap) > 1.2 ? T(z.LA - 0.4, (z.wA + z.wB) / 2 - 0.4, z.free ? 'θ' : 'gap', 'o', { anchor: 'end' }) : null,
          P(z.LA, z.wA, 'w_A', 'd', { dx: 9, dy: 16 }),
          P(z.LA, z.wB, 'w_B', 's', { dx: -9, dy: -8 }),
          G(z.LA, Math.min(z.wA, z.wB), 'L_A*', null),
        ];
      },
      readout(s) {
        const z = differentials(s);
        let status, tone;
        if (z.free) {
          status = `Workers move until the wage gap (${money(z.gap)}) equals the compensating differential θ. The whole gap is an equilibrium differential: it persists because B’s jobs are worse, not because anything stops workers moving.`;
          tone = 'good';
        } else if (Math.abs(z.extra) < 0.01) {
          status = 'With barriers the wage gap happens to equal θ, so no one would want to move.';
          tone = 'info';
        } else if (z.extra > 0) {
          status = `Barriers keep workers in A: the gap (${money(z.gap)}) exceeds θ by ${money(z.extra)}, a disequilibrium differential. Workers in A would gain by moving to B, and the excess gap would close if the barriers were removed.`;
          tone = 'warn';
        } else {
          status = `Barriers keep workers in B: the gap (${money(z.gap)}) is ${money(-z.extra)} short of θ, so B’s workers would rather move to A if they could.`;
          tone = 'warn';
        }
        return {
          rows: [
            ['Workers in A / in B', `${f(z.LA)} / ${f(z.LB)}`],
            ['Wage in A / in B', `${money(z.wA)} / ${money(z.wB)}`],
            ['Wage gap w_B − w_A', money(z.gap)],
            ['Compensating part (θ)', money(s.theta)],
            ['Disequilibrium part', money(z.extra)],
          ],
          status, tone,
        };
      },
    },
    extra: sourcesTable,
    equations: [
      { name: 'Equilibrium with free movement', tex: R`w_B - w_A = \theta`, note: 'Workers are indifferent between the jobs once the gap just pays for B’s disadvantages.' },
      { name: 'Splitting an observed gap', tex: R`w_B - w_A = \underbrace{\theta}_{\text{compensating}} + \underbrace{(w_B - w_A - \theta)}_{\text{disequilibrium}}`, note: 'The second part disappears when workers can move.' },
      { name: 'Two-sector allocation (this model)', tex: R`20 - 0.5L_A + \theta = d_B - 0.5(40 - L_A) \;\Rightarrow\; L_A = 40 + \theta - d_B` },
      { name: 'Wage in each occupation', tex: R`w = MRP_L = MP_L \times MR`, note: 'Differences in productivity (human capital) or in the value of output also create differentials.' },
    ],
    points: [
      'Equilibrium (compensating) differentials pay for non-wage differences: danger, dirt, stress, unsocial hours, insecurity, or the cost of training. They persist with free movement.',
      'Disequilibrium differentials arise when demand or supply changes and workers cannot move quickly: geographical immobility (housing, family) and occupational immobility (skills, qualifications). They narrow over time as workers move.',
      'Non-wage benefits work the other way: pleasant, secure or prestigious jobs can pay less (the net advantages of a job).',
      'Barriers such as licensing, closed shops and discrimination can keep a gap open indefinitely.',
      'Economic rent: a worker’s pay above their transfer earnings (what they could earn in their next-best job). Scarce talent earns large rents.',
    ],
    tip: 'Say whether a differential is compensating (equilibrium) or due to immobility or barriers (disequilibrium). In the two-sector diagram, the equilibrium allocation is where D_A meets D_B shifted down by the compensating differential.',
  };

  /* ── Human capital ── */
  // Age 18 to 64. Without a degree earnings are E0(t) = 20 + 0.4t (thousands a year, t = years since 18).
  // A degree of S years earns −F (fees, no earnings) while studying, then E0(t)(1 + p) for the rest of working life.
  const AGE0 = 18, AGE1 = 65;
  const e0 = (age) => 20 + 0.4 * (age - AGE0);
  const e1 = (s) => (age) => (age < AGE0 + s.S ? -s.F : e0(age) * (1 + s.p / 100));
  const npvAt = (s, r) => { let v = 0; for (let t = 0; t < AGE1 - AGE0; t++) v += (e1(s)(AGE0 + t) - e0(AGE0 + t)) / (1 + r) ** t; return v; };
  const human = (s) => {
    const r = s.r / 100;
    let costs = 0, gains = 0;
    for (let t = 0; t < AGE1 - AGE0; t++) {
      const d = (e1(s)(AGE0 + t) - e0(AGE0 + t)) / (1 + r) ** t;
      if (t < s.S) costs -= d; else gains += d;
    }
    let irr = null;
    if (npvAt(s, 0) > 0) { let lo = 0, hi = 5; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (npvAt(s, m) > 0) lo = m; else hi = m; } irr = lo; }
    let cum = 0, payback = null;
    for (let t = 0; t < AGE1 - AGE0; t++) { cum += e1(s)(AGE0 + t) - e0(AGE0 + t); if (cum >= 0 && t >= s.S) { payback = AGE0 + t + 1; break; } }
    return { costs, gains, npv: gains - costs, irr, payback };
  };
  const humanCapital = {
    id: 'human-capital',
    title: 'Human capital and the return to education',
    summary: 'Education and training are investments in human capital: they cost money and time now, and raise productivity and earnings later. A student should invest if the present value of the extra lifetime earnings exceeds the present value of the costs, which include the earnings given up while studying. Equivalently, invest if the internal rate of return on the course exceeds the interest rate.',
    model: 'Earnings without a degree rise from $20k at 18 by $0.4k a year. A degree takes S years, during which the student earns nothing and pays fees F a year; afterwards graduate earnings are a premium p above non-graduate earnings at the same age, until retirement at 65. Future amounts are discounted at the interest rate r.',
    graph: {
      x: { range: [AGE0, AGE1], label: 'Age', ticks: [18, 25, 30, 35, 40, 45, 50, 55, 60, 65], fmt: (v) => String(v) },
      y: { range: [-20, 70], label: 'Earnings ($ thousand a year)', ticks: range(-20, 70, 10) },
      params: [
        { id: 'p', label: 'Graduate earnings premium (p, %)', min: 0, max: 100, step: 1, value: 40 },
        { id: 'F', label: 'Fees per year of study (F, $k)', min: 0, max: 15, step: 0.5, value: 9 },
        { id: 'S', label: 'Years of study (S)', min: 1, max: 6, step: 1, value: 3 },
        { id: 'r', label: 'Interest rate (r, %)', min: 0, max: 12, step: 0.25, value: 3.5 },
      ],
      draw(s) {
        const g = AGE0 + s.S, E1 = (a) => e0(a) * (1 + s.p / 100);
        const costPoly = [[AGE0, e0(AGE0)], [g, e0(g)], [g, -s.F], [AGE0, -s.F]];
        const gainPoly = [];
        for (let a = g; a <= AGE1 + 1e-9; a += 0.5) gainPoly.push([a, E1(a)]);
        for (let a = AGE1; a >= g - 1e-9; a -= 0.5) gainPoly.push([a, e0(a)]);
        return [
          A(costPoly, 'r', 'Cost'),
          s.p > 0 ? A(gainPoly, 'g', s.p > 12 ? 'Extra earnings' : '') : null,
          Hl(0, 'ghost', ''),
          C(e0, 'n', '', { from: AGE0, to: AGE1 }),
          T(56, e0(56) - 4.5, 'No degree', 'n'),
          S(AGE0, -s.F, g, -s.F, 'd', '', { bold: true }),
          S(g, -s.F, g, E1(g), 'd', '', { dash: true }),
          C(E1, 'd', 'Graduate', { from: g, to: AGE1, labelAt: Math.max(g + 2, 48) }),
          G(g, Math.max(0, -s.F), String(g), null),
        ];
      },
      readout(s) {
        const z = human(s), r = s.r / 100;
        return {
          rows: [
            ['PV of costs (fees + earnings forgone)', `$${f(z.costs, 1)}k`],
            ['PV of extra earnings after graduating', `$${f(z.gains, 1)}k`],
            ['Net present value', `${z.npv < 0 ? '−' : ''}$${f(Math.abs(z.npv), 1)}k`],
            ['Internal rate of return', z.irr == null ? 'below 0% (never pays back)' : z.irr > 4.99 ? 'above 500%' : `${f(100 * z.irr, 1)}%`],
            ['Age when cumulative extra earnings turn positive', z.payback == null ? 'never' : String(z.payback)],
          ],
          status: z.npv > 0
            ? `Worth investing: NPV is positive, so the internal rate of return (${z.irr == null ? '—' : f(100 * z.irr, 1) + '%'}) beats the interest rate (${f(100 * r, 2)}%).`
            : `Not worth it on financial grounds: NPV is negative, so the return ${z.irr == null ? 'is below zero' : '(' + f(100 * z.irr, 1) + '%)'} does not beat the interest rate (${f(100 * r, 2)}%).`,
          tone: z.npv > 0 ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Net present value of education', tex: R`NPV = \sum_{t=0}^{T} \frac{B_t - C_t}{(1 + r)^t}`, note: 'B_t: extra earnings in year t; C_t: fees plus earnings forgone. Invest if NPV > 0.' },
      { name: 'Internal rate of return', tex: R`\sum_{t=0}^{T} \frac{B_t - C_t}{(1 + i)^t} = 0,\qquad \text{invest if } i > r` },
      { name: 'Perpetuity shortcut', tex: R`PV = \frac{X}{r}`, note: 'An extra X a year for ever, starting next year. Over n years: X[1 − (1 + r)^{−n}]/r.' },
      { name: 'Two-period version', tex: R`-C_0 + \frac{B_1}{1 + r} > 0 \iff \frac{B_1}{C_0} - 1 > r` },
    ],
    points: [
      'The costs include the opportunity cost of earnings forgone while studying, often larger than the fees.',
      'More people invest when the earnings premium rises, fees fall, the interest rate falls or working lives get longer; young people invest most because they have the longest payback period.',
      'Capital market failure: students cannot easily borrow against future earnings, so income-contingent loans or grants can raise investment toward the efficient level.',
      'General training (useful to any employer) is paid for by workers, through lower wages while training; specific training (useful only to this firm) is shared, because the firm can keep the return (Becker).',
      'Signalling (Spence): education may raise wages partly because it shows employers who is able and persistent, not only because it raises productivity. Then the private return can exceed the social return.',
      'Positive externalities from education (a more productive, informed population) justify public subsidies.',
    ],
    tip: 'Draw both age–earnings profiles and shade the cost (fees and forgone earnings) and the gain. Then compare present values: discounting shrinks the later gains far more than the early costs, so a higher interest rate can turn a positive NPV negative.',
  };

  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  const block = (window.TOPICS.find((t) => t.id === 'labour-market') || {}).block || 'Block 9';
  insertAfter('labour-market', monopsony, MICRO, block);
  insertAfter('monopsony', bilateralMonopoly, MICRO, block);
  insertAfter('bilateral-monopoly', wageDifferentials, MICRO, block);
  insertAfter('wage-differentials', humanCapital, MICRO, block);
})();
