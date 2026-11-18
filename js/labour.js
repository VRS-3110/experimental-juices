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
        { id: 'b', label: 'Slope of labour supply (b)', min: 0.02, max: 7, step: 0.05, value: 0.5, hint: 'smaller = more elastic supply' },
        { id: 'mw', label: 'Minimum wage (0 = none)', min: 0, max: 20, step: 0.5, value: 0 },
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
        { id: 'b', label: 'Slope of labour supply (b)', min: 0.02, max: 7, step: 0.05, value: 0.5 },
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
        { id: 'theta', label: 'Compensating differential for B (θ)', min: 0, max: 19, step: 0.5, value: 3 },
        { id: 'dB', label: 'Demand for labour in B (intercept d_B)', min: 4, max: 42, step: 0.5, value: 20 },
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
        { id: 'p', label: 'Graduate earnings premium (p, %)', min: 0, max: 500, step: 1, value: 40 },
        { id: 'F', label: 'Fees per year of study (F, $k)', min: 0, max: 75, step: 0.5, value: 9 },
        { id: 'S', label: 'Years of study (S)', min: 1, max: 20, step: 1, value: 3 },
        { id: 'r', label: 'Interest rate (r, %)', min: 0, max: 30, step: 0.25, value: 3.5 },
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

  /* ── Trade unions in a competitive labour market ── */
  // Demand w = 14 − b_d(L − 20) and supply w = 14 + 0.5(L − 20): both pass through the competitive
  // point (L = 20, w = 14), so changing the demand slope b_d keeps that point fixed.
  // Methods: 0 set a wage above the market wage; 1 restrict labour supply; 2 raise labour demand.
  const UW = 14, UL = 20, US = 0.5;
  const unionOut = (s) => {
    const bd = s.bd, dem = (L) => UW - bd * (L - UL), sup = (L) => UW + US * (L - UL);
    if (s.m === 0) {
      const wu = UW + 8 * s.k, LD = UL - (wu - UW) / bd, LS = UL + (wu - UW) / US;
      return { dem, sup, w: wu, L: LD, LS, unemp: LS - LD };
    }
    if (s.m === 1) {
      const shift = 16 * s.k, x = -US * shift / (bd + US);      // supply moves left by `shift` workers
      return { dem, sup, sup2: (L) => sup(L + shift), shift, L: UL + x, w: dem(UL + x), unemp: 0 };
    }
    const shift = 16 * s.k, x = (bd * shift) / (bd + US);       // demand moves right by `shift` workers
    return { dem, sup, dem2: (L) => dem(L - shift), shift, L: UL + x, w: sup(UL + x), unemp: 0 };
  };
  const tradeUnions = {
    id: 'trade-unions',
    title: 'Trade unions in a competitive labour market',
    summary: 'A trade union can raise its members’ pay in three ways: by bargaining for a wage above the market wage, by restricting the supply of labour to the occupation, or by raising the demand for its members’ labour. In a competitive labour market the first two raise wages only at the cost of jobs; raising demand can lift both. How many jobs are lost depends on how elastic the demand for labour is.',
    model: 'Labour demand w = 14 − b(L − 20) and labour supply w = 14 + 0.5(L − 20), so the competitive outcome is L = 20 at a wage of 14 whatever the demand slope b. Union strength k (0 to 1) sets how far the union pushes: a wage up to 8 above the market, or a shift of supply or demand by up to 16 workers.',
    graph: {
      x: { range: [0, 44], label: 'Workers (L)', ticks: range(0, 44, 4) },
      y: { range: [0, 28], label: 'Wage ($)', ticks: range(0, 28, 4) },
      params: [
        { id: 'm', label: 'How the union acts', options: [{ v: 0, label: 'Sets a wage' }, { v: 1, label: 'Restricts supply' }, { v: 2, label: 'Raises demand' }], value: 0 },
        { id: 'k', label: 'Union strength (k)', min: 0, max: 3, step: 0.01, value: 0.5 },
        { id: 'bd', label: 'Slope of labour demand (b)', min: 0.05, max: 9, step: 0.05, value: 0.5, hint: 'steeper = less elastic' },
      ],
      valid(s) {
        const z = unionOut(s);
        if (z.L < 1) return 'At this wage employers would hire almost no one: demand for labour is too elastic for such a large rise.';
        return true;
      },
      draw(s) {
        const z = unionOut(s), out = [];
        if (s.m === 0) {
          out.push(C(z.dem, 'd', 'D_L = MRP', { to: 44, labelAt: Math.min(40, UL + 13 / s.bd) }), C(z.sup, 'g', 'S_L', { to: 44, labelAt: 40 }));
          if (s.k > 0.005) {
            out.push(Hl(z.w, 'o', 'Union wage', { dash: true, labelLeft: true }));
            out.push(S(z.L, z.w, z.LS, z.w, 'r', '', { bold: true }));
            if (z.unemp > 3) out.push(T((z.L + z.LS) / 2, z.w + 0.9, 'Unemployed', 'r', { anchor: 'middle' }));
            out.push(P(z.LS, z.w, '', 'g', { small: true }), G(z.LS, z.w, 'L_S', null, 'g'));
          }
        } else if (s.m === 1) {
          out.push(C(z.dem, 'd', 'D_L = MRP', { to: 44, labelAt: Math.min(40, UL + 13 / s.bd) }), C(z.sup, 'ghost', 'S_L', { to: 44, labelAt: 40 }));
          if (s.k > 0.005) out.push(C(z.sup2, 'g', 'S_L (restricted)', { to: 44, labelAt: Math.max(4, 34 - z.shift) }));
        } else {
          out.push(C(z.sup, 'g', 'S_L', { to: 44, labelAt: 40 }), C(z.dem, 'ghost', 'D_L', { to: 44, labelAt: Math.min(36, UL + 10 / s.bd) }));
          if (s.k > 0.005) out.push(C(z.dem2, 'd', 'D_L (raised)', { to: 44, labelAt: Math.min(40, UL + z.shift + 8 / s.bd) }));
        }
        out.push(P(UL, UW, 'Competitive', 'n', { small: true, dx: s.m === 2 ? -9 : 9, dy: s.m === 0 ? 16 : -8 }));
        out.push(G(z.L, z.w, 'L', 'w'), P(z.L, z.w, 'Union outcome', 'o', s.m === 0 && s.k > 0.005 ? { dx: -9, dy: 18 } : {}));
        return out;
      },
      readout(s) {
        const z = unionOut(s);
        const rows = [
          ['Wage (competitive 14)', money(z.w)],
          ['Employment (competitive 20)', f(z.L)],
          ['Union wage premium', pct((100 * (z.w - UW)) / UW)],
          ['Change in employment', `${z.L >= UL ? '+' : '−'}${f(Math.abs(z.L - UL))}`],
          ['Wage bill wL (competitive 280)', money(z.w * z.L)],
        ];
        if (s.m === 0) rows.push(['Workers wanting jobs but not hired', f(z.unemp)]);
        let status, tone = 'info';
        if (s.k < 0.005) status = 'No union effect: the market sets a wage of 14 and employs 20.';
        else if (s.m === 0) { status = `The union wage is above the market wage, so employers move up the labour demand curve and hire ${f(UL - z.L)} fewer workers, while ${f(z.LS - UL)} more want jobs. The less elastic the demand for labour (steeper b), the fewer jobs are lost.`; tone = 'warn'; }
        else if (s.m === 1) { status = `Restricting entry (a closed shop, licensing, long apprenticeships) shifts supply left: the wage rises to ${money(z.w)} and employment falls to ${f(z.L)}. Excluded workers crowd into other occupations and push wages down there.`; tone = 'warn'; }
        else { status = `Raising the demand for labour (productivity deals, campaigns to buy the product) lifts both the wage (${money(z.w)}) and employment (${f(z.L)}).`; tone = 'good'; }
        return { rows, status, tone };
      },
    },
    equations: [
      { name: 'Employment at a union wage', tex: R`L = L_D(w_U) < L^*,\qquad \text{unemployment} = L_S(w_U) - L_D(w_U)`, note: 'In a competitive market the employer chooses employment on its demand curve.' },
      { name: 'Jobs lost and the elasticity of labour demand', tex: R`\frac{\%\Delta L}{\%\Delta w} = \varepsilon_D`, note: 'The smaller |ε_D|, the less employment falls for a given wage rise.' },
      { name: 'Union wage premium', tex: R`\text{premium} = \frac{w_U - w_N}{w_N}`, note: 'Union wage w_U against the non-union wage w_N for similar workers.' },
      { name: 'Wage-bill-maximising union', tex: R`MR_L = 0 \iff |\varepsilon_D| = 1`, note: 'A union that maximises its members’ total pay picks the point of unit elasticity on labour demand, if that is above the competitive wage.' },
    ],
    points: [
      'Marshall’s rules: labour demand is less elastic, and unions stronger, when labour is hard to substitute, labour is a small share of total cost, demand for the product is inelastic, and other inputs are inelastically supplied.',
      'Union goals differ: maximise members’ employment, the wage, the wage bill, or members’ total rent. Higher wages for insiders can mean fewer jobs for outsiders (insider–outsider theory).',
      'The UK union wage premium has fallen as membership fell from over half of workers in 1979 to about a fifth today.',
      'Against monopsony, a union can raise both wages and employment (see bilateral monopoly).',
      'Possible benefits: a collective voice for workers (Freeman and Medoff), lower quit rates, better training and safety. Possible costs: lost jobs, strikes and restrictive practices.',
    ],
    tip: 'Say which kind of labour market you are in. In a competitive market, show the union wage as a horizontal line above equilibrium, mark employment on the demand curve and the excess supply of labour. State that the job loss depends on the elasticity of labour demand.',
  };

  /* ── Efficiency wages ── */
  // Effort e(w) = 10((w − u)/24)^β for w > u, where u is the worker's outside option.
  // The firm minimises the wage per unit of effort w/e: the Solow condition (elasticity of effort = 1)
  // gives w* = u/(1 − β). Labour market: L_D = 40 − 2w (w = 20 − 0.5L), L_S = 2w (w = 0.5L).
  const effort = (s) => (w) => (w > s.u ? 10 * ((w - s.u) / 24) ** s.beta : 0);
  const eff = (s) => {
    const ws = s.u / (1 - s.beta), es = effort(s)(ws), wc = 10;
    const paid = Math.max(ws, wc), L = 40 - 2 * paid, LS = 2 * paid;
    return { ws, es, perEffort: ws / es, wc, paid, L, LS, unemp: LS - L, binding: ws > wc };
  };
  const efficiencyWages = {
    id: 'efficiency-wages',
    title: 'Efficiency wages',
    summary: 'An efficiency wage is a wage set above the market-clearing level because paying more raises productivity. Better-paid workers shirk less (they have more to lose if caught and sacked), quit less, attract better applicants and feel fairly treated. A firm sets the wage that minimises its cost per unit of effort. Because every firm pays above the market wage, more people want jobs than there are jobs: involuntary unemployment that does not go away by itself.',
    model: 'Effort e(w) = 10((w − u)/24)^β for wages above the worker’s outside option u, so effort rises with the wage at a falling rate. The firm minimises the wage per unit of effort, w/e(w), which gives the Solow condition: the elasticity of effort with respect to the wage equals 1, so w* = u/(1 − β). Labour market: demand L_D = 40 − 2w, supply L_S = 2w, clearing at w = 10.',
    graph: {
      layout: 'row',
      params: [
        { id: 'u', label: 'Worker’s outside option (u)', min: 0.5, max: 12, step: 0.5, value: 6, hint: 'benefits, or pay elsewhere' },
        { id: 'beta', label: 'How strongly effort responds to pay (β)', min: 0.05, max: 0.9, step: 0.05, value: 0.5 },
      ],
      valid(s) {
        if (eff(s).ws > 19) return 'The efficiency wage would be so high that firms would hire almost no one.';
        return true;
      },
      panels: [
        {
          title: 'The firm: effort and the wage',
          x: { range: [0, 24], label: 'Wage (w)', ticks: range(0, 24, 4) },
          y: { range: [0, 10], label: 'Effort per worker (e)', ticks: range(0, 10, 2) },
          draw(s) {
            const z = eff(s), e = effort(s), slope = z.es / z.ws;
            return [
              C(e, 'g', '', { from: s.u, to: 24 }),
              T(Math.min(19, z.ws + 5), e(Math.min(19, z.ws + 5)) - 0.9, 'Effort e(w)', 'g'),
              C((w) => slope * w, 'o', '', { to: Math.min(24, 10 / slope), dash: true }),
              T(0.8 * Math.min(24, 10 / slope) - 0.3, slope * 0.8 * Math.min(24, 10 / slope) + 0.35, 'Ray from origin', 'o', { anchor: 'end' }),
              V(s.u, 'ghost', 'u'),
              G(z.ws, z.es, 'w*', 'e*'),
              P(z.ws, z.es, 'Lowest wage per unit of effort', 'o', { dx: 9, dy: 20 }),
            ];
          },
        },
        {
          title: 'The labour market: unemployment',
          x: { range: [0, 40], label: 'Workers (L)', ticks: range(0, 40, 5) },
          y: { range: [0, 24], label: 'Wage (w)', ticks: range(0, 24, 4) },
          draw(s) {
            const z = eff(s), out = [
              C((L) => 20 - 0.5 * L, 'd', 'D_L', { to: 40, labelAt: 33 }),
              C((L) => 0.5 * L, 'g', 'S_L', { to: 40, labelAt: 36 }),
              P(20, 10, 'Market-clearing', 'n', { small: true, dx: 9, dy: 16 }),
            ];
            if (z.binding) {
              out.push(Hl(z.ws, 'o', 'Efficiency wage', { dash: true, labelLeft: true }));
              out.push(S(z.L, z.ws, z.LS, z.ws, 'r', '', { bold: true }));
              if (z.unemp > 4) out.push(T((z.L + z.LS) / 2, z.ws + 0.9, 'Unemployed', 'r', { anchor: 'middle' }));
              out.push(G(z.L, z.ws, 'L', null), P(z.L, z.ws, 'Employed', 'o', { dx: -9, dy: 18 }), P(z.LS, z.ws, '', 'g', { small: true }));
            }
            return out;
          },
        },
      ],
      readout(s) {
        const z = eff(s);
        return {
          rows: [
            ['Efficiency wage w* = u/(1 − β)', money(z.ws)],
            ['Effort at w*', f(z.es)],
            ['Wage per unit of effort at w*', money(z.perEffort)],
            ['Market-clearing wage', money(z.wc)],
            ['Wage paid / employment', `${money(z.paid)} / ${f(z.L)}`],
            ['Involuntary unemployment', f(Math.max(0, z.unemp))],
          ],
          status: z.binding
            ? `Firms pay ${money(z.ws)}, above the market-clearing wage of ${money(z.wc)}, because the extra effort more than pays for itself. ${f(z.unemp)} workers would take a job at that wage but cannot get one, and wages do not fall: a firm that cut pay would get less effort per pound.`
            : `The efficiency wage (${money(z.ws)}) is below the market-clearing wage, so firms simply pay the market wage of ${money(z.wc)} and the labour market clears.`,
          tone: z.binding ? 'warn' : 'info',
        };
      },
    },
    equations: [
      { name: 'Firm’s problem', tex: R`\min_w \; \frac{w}{e(w)}`, note: 'Cost per unit of effort, not cost per worker.' },
      { name: 'Solow condition', tex: R`\frac{de}{dw}\cdot\frac{w}{e} = 1 \iff \frac{de}{dw} = \frac{e}{w}`, note: 'At w* the ray from the origin is tangent to the effort curve.' },
      { name: 'This model', tex: R`e = 10\Big(\frac{w - u}{24}\Big)^{\beta} \;\Rightarrow\; \frac{\beta w}{w - u} = 1 \;\Rightarrow\; w^* = \frac{u}{1 - \beta}` },
      { name: 'Involuntary unemployment', tex: R`L_S(w^*) - L_D(w^*) > 0 \quad \text{when } w^* > w_c` },
    ],
    points: [
      'Shirking model (Shapiro and Stiglitz): if monitoring is imperfect, a wage above the outside option makes the threat of dismissal costly, so workers put in effort. Unemployment is the discipline device.',
      'Turnover model: higher pay cuts quits, saving hiring and training costs.',
      'Adverse selection model: a higher wage attracts a better pool of applicants when the firm cannot observe ability.',
      'Gift exchange (Akerlof): workers respond to a fair wage with extra effort.',
      'Example often cited: Henry Ford’s $5 day in 1914 halved quit rates and raised productivity.',
      'Macroeconomic implication: wages are rigid downward and unemployment can persist, because cutting wages would cut effort. A higher outside option (better benefits, lower unemployment) raises the efficiency wage.',
    ],
    tip: 'Draw effort against the wage with a ray from the origin tangent to it: the tangency is the efficiency wage. Then show it as a horizontal line above equilibrium in the labour market and label the gap as involuntary unemployment. Explain one mechanism (shirking, turnover, selection) in words.',
  };

  /* ── Discrimination (Becker employer discrimination) ── */
  // Groups A and B are equally productive: each has labour demand (MRP) w = 24 − 0.5L and supply
  // w = 4 + 0.5L, so without discrimination both earn 14 with 20 employed. A share s of employers
  // discriminate against B with coefficient d: they act as if a B worker costs w(1 + d).
  // Market demand for B: L = (1 − s)·2(24 − w) + s·2(24 − (1 + d)w) = 48 − 2w(1 + sd).
  // Discriminators hire no B workers once w ≥ 24/(1 + d), so market demand has a kink there.
  const disc = (s) => {
    const k = 1 + s.share * s.d, wk = 24 / (1 + s.d);
    let wB = 56 / (2 + 2 * k);                              // both kinds of employer hiring: 48 − 2kw = 2w − 8
    if (wB > wk) wB = (4 + 24 * (1 - s.share)) / (2 - s.share); // only non-discriminators hire: 2(1 − s)(24 − w) = 2w − 8
    const LB = 2 * (wB - 4), Lk = 2 * (1 - s.share) * (24 - wk);
    const demB = (L) => (L <= Lk && s.share < 1 ? 24 - L / (2 * (1 - s.share)) : (48 - L) / (2 * k));
    return { k, wA: 14, LA: 20, wB, LB, gap: 14 - wB, demB };
  };
  const discrimination = {
    id: 'discrimination',
    title: 'Labour market discrimination',
    summary: 'Discrimination in the labour market means paying or treating equally productive workers differently because of a characteristic such as sex, ethnicity, disability or age. In Becker’s model of employer discrimination, prejudiced employers act as if hiring a worker from the disfavoured group costs more than the wage. Demand for that group falls, so its wage and employment fall, even though its productivity is the same.',
    model: 'Group A and group B are equally productive and equally willing to work: each has labour demand (MRP) w = 24 − 0.5L and supply w = 4 + 0.5L, so without discrimination both earn 14 and 20 of each are employed. A share s of employers discriminate against B with a discrimination coefficient d: they act as if a B worker costs w(1 + d). Market demand for B is the sum of non-discriminating and discriminating employers’ demand.',
    graph: {
      x: { range: [0, 40], label: 'Group B workers (L_B)', ticks: range(0, 40, 5) },
      y: { range: [0, 24], label: 'Wage ($)', ticks: range(0, 24, 4) },
      params: [
        { id: 'd', label: 'Discrimination coefficient (d)', min: 0, max: 5, step: 0.01, value: 0.3 },
        { id: 'share', label: 'Share of employers who discriminate (s)', min: 0, max: 1, step: 0.01, value: 1 },
      ],
      draw(s) {
        const z = disc(s), on = z.k > 1.0005, out = [];
        if (on) out.push(A([[z.LB, z.wB], [20, 14], [z.LB, 4 + 0.5 * z.LB]], 'r', ''));
        out.push(
          C((L) => 24 - 0.5 * L, on ? 'ghost' : 'd', on ? 'MRP (no discrimination)' : 'D = MRP', { to: 40, labelAt: on ? 3 : 30 }),
          C((L) => 4 + 0.5 * L, 'g', 'S_B', { to: 40, labelAt: 36 }),
        );
        if (on) {
          out.push(C(z.demB, 'd', 'D_B with discrimination', { to: 40, labelAt: Math.min(30, 34 - 6 * (z.k - 1)) }));
          out.push(Hl(14, 'ghost', 'w_A = 14', { labelLeft: true }));
          if (z.gap > 0.6) out.push(S(z.LB, z.wB, z.LB, 14, 'o', '', { bold: true }));
          out.push(P(20, 14, 'Group A', 'n', { small: true, dx: 9, dy: -8 }));
        }
        out.push(G(z.LB, z.wB, 'L_B', 'w_B'), P(z.LB, z.wB, on ? 'Group B' : 'Both groups', 'o', { dx: 9, dy: 18 }));
        return out;
      },
      readout(s) {
        const z = disc(s);
        return {
          rows: [
            ['Wage of group A', money(z.wA)],
            ['Wage of group B', money(z.wB)],
            ['Wage gap (as % of A’s wage)', `${money(z.gap)} (${pct((100 * z.gap) / z.wA)})`],
            ['Employment of A / of B', `${f(z.LA)} / ${f(z.LB)}`],
            ['Cost of a B worker as discriminators see it', money(z.wB * (1 + s.d))],
            ['Lost output (DWL)', money(0.5 * (24 - 0.5 * z.LB - (4 + 0.5 * z.LB)) * (20 - z.LB))],
          ],
          status: z.k <= 1.0005
            ? 'No discrimination: equally productive groups earn the same wage and are employed in the same numbers.'
            : s.share < 0.999
              ? `Only some employers discriminate, so the gap (${money(z.gap)}) is smaller. Non-discriminating employers hire B workers at ${money(z.wB)} although they are worth the same as A workers: they make more profit, and in the long run competition should drive out discrimination (Becker), unless barriers protect the discriminators.`
              : `Every employer discriminates: B workers are as productive as A but earn ${money(z.gap)} less and fewer are employed. Discriminating employers also lose: they give up profitable workers.`,
          tone: z.k <= 1.0005 ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Discriminating employer’s hiring rule', tex: R`MRP_L = w_B(1 + d)`, note: 'The employer hires B workers as if each cost (1 + d) times the wage.' },
      { name: 'Wage gap with equal productivity', tex: R`w_B = \frac{MRP_L}{1 + d} < w_A = MRP_L` },
      { name: 'Oaxaca decomposition of a measured gap', tex: R`\bar{w}_A - \bar{w}_B = \underbrace{(\bar{X}_A - \bar{X}_B)\,\beta_A}_{\text{explained}} + \underbrace{\bar{X}_B(\beta_A - \beta_B)}_{\text{unexplained}}`, note: 'X: productivity-related characteristics; β: the pay return to them. The unexplained part is an upper bound on discrimination.' },
    ],
    points: [
      'Employer discrimination (taste-based, Becker): prejudiced employers pay a price for their prejudice in lost profit, so competition should erode it over time; it persists where competition is weak.',
      'Employee and customer discrimination: co-workers or customers who dislike a group can make employers segregate the workforce or pay that group less.',
      'Statistical discrimination: employers who cannot observe individual productivity judge by group averages. It can be profit-maximising and still unfair, and it can discourage the group from investing in skills.',
      'Occupational crowding: if a group is kept out of some occupations, it crowds into the rest, pushing wages down there.',
      'Not every pay gap is discrimination: differences in hours, experience, qualifications and job choice explain part. But job choice can itself reflect pre-labour-market discrimination.',
      'Policy: equal pay and anti-discrimination law (in the UK, the Equality Act 2010), gender pay gap reporting, blind recruitment, and better childcare and parental leave.',
    ],
    tip: 'Draw the market for the disfavoured group with demand pushed down by the discrimination coefficient: lower wage and employment for the same MRP. Then evaluate: competition should erode employer discrimination, statistical discrimination may persist, and a measured gap overstates discrimination if productivity differs.',
  };

  /* ── Labour market policy ── */
  // Labour demand w = 24 − 0.5L, labour supply w = 4 + bL. Policy size x from 0 to 1.
  // 0: minimum wage w0 + 8x. 1: wage subsidy 6x per worker paid to employers. 2: tax on labour 6x per worker.
  // 3: higher out-of-work benefits raise the reservation wage by 6x (supply shifts up).
  const POL = ['National minimum wage', 'Wage subsidy', 'Tax on labour', 'Higher benefits'];
  const policy = (s) => {
    const b = s.b, L0 = 20 / (0.5 + b), w0 = 4 + b * L0, dem = (L) => 24 - 0.5 * L, sup = (L) => 4 + b * L;
    const out = { L0, w0, dem, sup };
    if (s.pol === 0) {
      const w = w0 + 8 * s.x, L = 2 * (24 - w), LS = (w - 4) / b;
      return { ...out, L, wWorker: w, wEmployer: w, LS, unemp: LS - L, budget: 0, dwl: 0.5 * (dem(L) - sup(L)) * (L0 - L) };
    }
    if (s.pol === 1 || s.pol === 2) {
      const t = (s.pol === 1 ? -1 : 1) * 6 * s.x;            // wedge: employer cost − worker wage
      const L = (20 - t) / (0.5 + b), wWorker = sup(L), wEmployer = wWorker + t;
      return { ...out, L, wWorker, wEmployer, t, budget: t * L, dwl: 0.5 * Math.abs(t) * Math.abs(L0 - L), workerShare: Math.abs(t) > 1e-9 ? Math.abs(w0 - wWorker) / Math.abs(t) : b / (0.5 + b) };
    }
    const r = 6 * s.x, L = (20 - r) / (0.5 + b), w = dem(L);
    return { ...out, L, wWorker: w, wEmployer: w, r, sup2: (x) => sup(x) + r, budget: 0, dwl: null };
  };
  const labourPolicy = {
    id: 'labour-policy',
    title: 'Labour market policy',
    summary: 'Governments intervene in labour markets to raise low pay, increase employment and raise revenue. Each tool works differently: a minimum wage fixes the price of labour; a wage subsidy lowers what employers pay; a tax on labour drives a wedge between what employers pay and what workers take home; more generous benefits raise the wage people need before they will work. How the effects are shared depends on how elastic labour supply and demand are.',
    model: 'Labour demand w = 24 − 0.5L and labour supply w = 4 + bL. Policy size x runs from 0 to 1: a minimum wage up to 8 above the market wage; a subsidy or a tax of up to 6 per worker; or benefits that raise the reservation wage by up to 6. The slope b sets how elastic labour supply is.',
    graph: {
      x: { range: [0, 48], label: 'Workers (L)', ticks: range(0, 48, 4) },
      y: { range: [0, 30], label: 'Wage ($)', ticks: range(0, 30, 5) },
      params: [
        { id: 'pol', label: 'Policy', options: POL.map((label, v) => ({ v, label })), value: 2 },
        { id: 'x', label: 'Size of the policy (x)', min: 0, max: 3, step: 0.01, value: 0.5 },
        { id: 'b', label: 'Slope of labour supply (b)', min: 0.02, max: 9, step: 0.05, value: 0.5, hint: 'steeper = less elastic' },
      ],
      valid(s) {
        const z = policy(s);
        if (z.L < 1) return 'At this minimum wage employers would hire almost no one.';
        return true;
      },
      draw(s) {
        const z = policy(s), on = s.x > 0.005, out = [];
        out.push(C(z.dem, 'd', 'D_L', { to: 48, labelAt: 42 }));
        if (s.pol === 3) {
          out.push(C(z.sup, on ? 'ghost' : 'g', 'S_L', { to: 48, labelAt: Math.min(44, 22 / s.b) }));
          if (on) out.push(C(z.sup2, 'g', 'S_L (higher benefits)', { to: 48, labelAt: Math.max(2, Math.min(30, (20 - z.r) / s.b)) }));
        } else {
          out.push(C(z.sup, 'g', 'S_L', { to: 48, labelAt: Math.min(44, 24 / s.b) }));
        }
        if (on && s.pol === 0) {
          out.push(Hl(z.wWorker, 'o', 'Minimum wage', { dash: true, labelLeft: true }));
          out.push(S(z.L, z.wWorker, Math.min(48, z.LS), z.wWorker, 'r', '', { bold: true }));
          if (z.unemp > 4) out.push(T((z.L + Math.min(48, z.LS)) / 2, z.wWorker + 1, 'Unemployed', 'r', { anchor: 'middle' }));
        }
        if (on && (s.pol === 1 || s.pol === 2)) {
          const lo = Math.min(z.wWorker, z.wEmployer), hi = Math.max(z.wWorker, z.wEmployer);
          out.push(A([[z.L, hi], [z.L0, z.w0], [z.L, lo]], 'r', ''));
          out.push(S(z.L, lo, z.L, hi, 'o', '', { bold: true }));
          out.push(P(z.L, z.wEmployer, 'Employer pays', 'd', { small: true, dx: s.pol === 1 ? 9 : -9, dy: s.pol === 1 ? 16 : -8 }));
          out.push(P(z.L, z.wWorker, 'Worker gets', 'g', { small: true, dx: s.pol === 1 ? -9 : 9, dy: s.pol === 1 ? -8 : 16 }));
        }
        out.push(P(z.L0, z.w0, 'No policy', 'n', { small: true, dx: s.pol === 1 && on ? -10 : 10, dy: s.pol === 0 && on ? 16 : 4 }));
        out.push(G(z.L, z.wWorker, 'L', 'w'));
        if (!(on && (s.pol === 1 || s.pol === 2))) out.push(P(z.L, z.wWorker, 'Outcome', 'o', { dx: -9, dy: 18 }));
        return out;
      },
      readout(s) {
        const z = policy(s), on = s.x > 0.005;
        const rows = [
          ['Take-home wage (no policy)', `${money(z.wWorker)} (${money(z.w0)})`],
          ['Cost of a worker to the employer', money(z.wEmployer)],
          ['Employment (no policy)', `${f(z.L)} (${f(z.L0)})`],
        ];
        if (s.pol === 0) rows.push(['Workers wanting jobs but not hired', f(z.unemp)]);
        if (s.pol === 1) rows.push(['Cost to the government', money(-z.budget)], ['Share of the subsidy reaching workers', pct(100 * z.workerShare)]);
        if (s.pol === 2) rows.push(['Tax revenue', money(z.budget)], ['Share of the tax borne by workers', pct(100 * z.workerShare)]);
        if (z.dwl != null) rows.push(['Deadweight loss', money(z.dwl)]);
        let status, tone = 'info';
        if (!on) status = 'No policy: the market clears where labour demand meets supply.';
        else if (s.pol === 0) { status = `A minimum wage above the market wage raises pay for those who keep their jobs but cuts employment by ${f(z.L0 - z.L)} in a competitive market, and draws in ${f(z.LS - z.L0)} more job-seekers. (Under monopsony it can raise employment: see the monopsony topic.)`; tone = 'warn'; }
        else if (s.pol === 1) { status = `The subsidy raises employment by ${f(z.L - z.L0)} and lifts take-home pay, at a cost of ${money(-z.budget)}. Workers get ${pct(100 * z.workerShare)} of it; the less elastic labour supply is, the more goes to workers.`; tone = 'good'; }
        else if (s.pol === 2) { status = `The tax wedge cuts employment by ${f(z.L0 - z.L)} and raises ${money(z.budget)}. Workers bear ${pct(100 * z.workerShare)} of it: whoever is less elastic bears more, whichever side legally pays.`; tone = 'warn'; }
        else { status = `Higher benefits raise the wage people need before taking a job (the reservation wage), so labour supply shifts up: the wage rises to ${money(z.wWorker)} and employment falls by ${f(z.L0 - z.L)}. This is a trade-off between protecting people out of work and work incentives.`; tone = 'info'; }
        return { rows, status, tone };
      },
    },
    equations: [
      { name: 'Tax or subsidy wedge', tex: R`w_{employer} = w_{worker} + t \quad (t < 0 \text{ for a subsidy})` },
      { name: 'Who bears a tax on labour', tex: R`\frac{\text{worker share}}{\text{employer share}} = \frac{\varepsilon_D}{\varepsilon_S}`, note: 'The less elastic side bears more. With very inelastic labour supply, workers bear almost all of it.' },
      { name: 'Deadweight loss of a wedge', tex: R`DWL = \tfrac{1}{2}\,|t|\,|L_0 - L|` },
      { name: 'Minimum wage (competitive market)', tex: R`L = L_D(w_{min}) < L_0,\qquad \text{excess supply} = L_S(w_{min}) - L_D(w_{min})` },
    ],
    points: [
      'Minimum wage: raises low pay but can cost jobs in competitive markets; under monopsony a moderate minimum can raise employment. UK evidence from the Low Pay Commission finds small employment effects so far.',
      'Wage subsidies and in-work benefits (for example Universal Credit’s taper): raise employment and take-home pay, but cost public money, and part leaks to employers. They avoid the job losses of a minimum wage.',
      'Taxes on labour (income tax, National Insurance): the wedge reduces employment; incidence does not depend on who legally pays.',
      'Out-of-work benefits: protect incomes but raise the reservation wage; conditionality and job-search requirements aim to limit the effect.',
      'Supply-side policies: training and education (raise MRP, shifting demand right), better information and job matching, help with moving or childcare (reduce immobility), and immigration (raises labour supply).',
      'Active labour market policies (training, job search help, hiring subsidies) target the unemployed directly; passive policies pay benefits.',
    ],
    tip: 'Name the policy’s mechanism on the diagram: a price floor (minimum wage), a wedge between employer cost and take-home pay (tax or subsidy), or a shift of supply or demand (benefits, training). Then discuss elasticities for incidence and employment, and say who pays: firms, workers or the taxpayer.',
  };

  /* ── Deriving labour demand from MVP_L ── */
  // Short-run production Q = A(10L − L²/2), so MP_L = A(10 − L). Competitive output market at price p:
  // MVP_L = p·MP_L, and the firm hires until MVP_L = w, so L_D(w) = 10 − w/(pA).
  // Monopoly option: output demand P = 2p(1 − Q/100), MR = 2p(1 − Q/50); MRP_L = MR·MP_L < MVP_L = P·MP_L.
  const tp = (A) => (L) => A * (10 * L - 0.5 * L * L);
  const mpl = (A) => (L) => A * (10 - L);
  const mvpCurves = (s) => {
    const Q = tp(s.A), MP = mpl(s.A);
    if (s.m === 0) { const v = (L) => s.p * MP(L); return { mvp: v, demand: v, price: () => s.p }; }
    const price = (L) => 2 * s.p * (1 - Q(L) / 100), mr = (L) => 2 * s.p * (1 - Q(L) / 50);
    return { mvp: (L) => price(L) * MP(L), demand: (L) => Math.max(0, mr(L)) * MP(L), price };
  };
  const solveL = (fn, w) => { // fn falls in L on [0, 10]
    if (fn(0) <= w) return 0;
    let lo = 0, hi = 10; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (fn(m) > w) lo = m; else hi = m; }
    return lo;
  };
  const mvpOut = (s) => {
    const c = mvpCurves(s), L = solveL(c.demand, s.w), Le = solveL(c.mvp, s.w);
    return { ...c, L, Le, Q: tp(s.A)(L), MP: mpl(s.A)(L), P: c.price(L), top: (s.m ? 2 : 1) * s.p * s.A * 10 };
  };
  const mvpDemand = {
    id: 'mvp-demand',
    title: 'Deriving labour demand from MVP',
    summary: 'A firm’s demand for labour comes from what each extra worker adds to its revenue. With a competitive output market, the last worker adds the value of their marginal product, MVP_L = P × MP_L. The firm hires until MVP_L equals the wage. Each wage then picks out one point on the MVP_L curve, so the MVP_L curve is the firm’s labour demand curve. It slopes down because of diminishing marginal returns.',
    model: 'Short-run production Q = A(10L − L²/2), so the marginal product of labour is MP_L = A(10 − L), falling as more workers share fixed capital. In a competitive output market the price P is given, so MVP_L = P × A(10 − L) and labour demand is L = 10 − w/(PA). With the monopoly option the firm faces output demand P = 2p(1 − Q/100), and the extra revenue from a worker is MRP_L = MR × MP_L, below MVP_L.',
    graph: {
      layout: 'column',
      params: [
        { id: 'm', label: 'Output market', options: [{ v: 0, label: 'Perfect competition (MVP)' }, { v: 1, label: 'Monopoly (MRP < MVP)' }], value: 0 },
        { id: 'w', label: 'Wage (w)', min: 0.5, max: 100, step: 0.5, value: 20 },
        { id: 'p', label: 'Output price (P; p for the monopoly)', min: 0.5, max: 32, step: 0.1, value: 5 },
        { id: 'A', label: 'Labour productivity (A)', min: 0.2, max: 4.6, step: 0.05, value: 1 },
      ],
      valid(s) {
        if (mvpOut(s).L < 0.2 - 1e-6) return 'At this wage the firm would hire no one: the wage is above the value of even the first worker’s output.';
        return true;
      },
      panels: [
        {
          title: 'Production: total product and the marginal product',
          x: { range: [0, 10], label: 'Workers (L)', ticks: range(0, 10, 1) },
          y: (s) => { const top = 10 * Math.ceil(5.6 * s.A); return { range: [0, top], label: 'Output (Q)', ticks: range(0, top, top / 5) }; },
          draw(s) {
            const z = mvpOut(s), Q = tp(s.A), a = Math.max(0, z.L - 1.6), b = Math.min(10, z.L + 1.6);
            return [
              C(Q, 'n', 'TP', { to: 10, labelAt: 9 }),
              S(a, z.Q + z.MP * (a - z.L), b, z.Q + z.MP * (b - z.L), 'o', '', { dash: true }),
              T(z.L + 0.35, z.Q - 0.1 * 10 * Math.ceil(5.6 * s.A), `slope = MP_L = ${f(z.MP, 1)}`, 'o'),
              G(z.L, z.Q, 'L*', 'Q*'),
              P(z.L, z.Q, ''),
            ];
          },
        },
        {
          title: (s) => (s.m ? 'Revenue from one more worker: MRP below MVP' : 'Value of the marginal product: MVP = P × MP'),
          x: { range: [0, 10], label: 'Workers (L)', ticks: range(0, 10, 1) },
          y: (s) => { const top = 10 * Math.ceil(mvpOut(s).top / 10); return { range: [0, top], label: '$ per worker', ticks: range(0, top, top / 5) }; },
          draw(s) {
            const z = mvpOut(s), out = [];
            out.push(C(z.mvp, s.m ? 'ghost' : 'd', s.m ? 'MVP_L = P × MP_L' : 'MVP_L = D_L', { to: 10, labelAt: s.m ? 1.2 : 7.5 }));
            if (s.m) { const la = Math.min(6, solveL(z.demand, Math.max(s.w + 0.25 * z.top, 0.4 * z.top))); out.push(C(z.demand, 'd', 'MRP_L = D_L', { to: 10, labelAt: la })); }
            out.push(Hl(s.w, 'o', `wage = ${money(s.w)}`, { dash: true, labelLeft: true }));
            // Other wages trace out the demand curve.
            for (const fr of [0.2, 0.4, 0.6, 0.8]) {
              const wi = fr * z.demand(0), Li = solveL(z.demand, wi);
              if (Math.abs(wi - s.w) > 0.04 * z.top) out.push(P(Li, wi, '', 'n', { small: true }));
            }
            if (s.m && z.Le - z.L > 0.15) out.push(S(z.L, s.w, z.Le, s.w, 'r', '', { bold: true }), P(z.Le, s.w, 'MVP = w', 'n', { small: true, dx: 9, dy: -8 }));
            out.push(G(z.L, s.w, 'L*', null), P(z.L, s.w, s.m ? 'MRP = w' : 'MVP = w', 'o', { dx: -9, dy: 18 }));
            return out;
          },
        },
      ],
      readout(s) {
        const z = mvpOut(s);
        const rows = [
          ['Workers hired L*', f(z.L)],
          ['Marginal product of the last worker', f(z.MP)],
          ['Output price', money(z.P)],
          ['Value of that worker’s output (P × MP)', money(z.P * z.MP)],
        ];
        if (s.m) rows.push(['Extra revenue from that worker (MRP = w)', money(s.w)], ['Workers hired if MVP = w (efficient)', f(z.Le)]);
        rows.push(['Real wage w/P = MP_L', f(s.w / z.P)]);
        return {
          rows,
          status: s.m
            ? `A monopolist must cut its price to sell more, so the extra revenue from a worker (MR × MP_L) is below the value of their output (P × MP_L). It hires ${f(z.L)} workers where MRP_L = w, not ${f(z.Le)}: its labour demand is MRP_L, which lies below MVP_L.`
            : `The firm hires until the last worker’s output is worth exactly the wage: ${money(s.w)} buys ${f(z.L)} workers. Move the wage slider and the chosen point slides along MVP_L (the grey dots are other wages), so MVP_L is the labour demand curve. A higher output price or productivity shifts it right.`,
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Value of the marginal product', tex: R`MVP_L = P \times MP_L` },
      { name: 'Hiring rule (competitive firm)', tex: R`MVP_L = w \iff MP_L = \frac{w}{P}`, note: 'Equivalently, hire until the marginal product equals the real wage.' },
      { name: 'Labour demand is the MVP_L curve', tex: R`L_D(w):\; P \times MP_L(L) = w`, note: 'Each wage gives one employment level on MVP_L. It slopes down because MP_L falls (diminishing returns).' },
      { name: 'This model', tex: R`MP_L = A(10 - L) \;\Rightarrow\; L_D = 10 - \frac{w}{PA}` },
      { name: 'Imperfect competition in the output market', tex: R`MRP_L = MR \times MP_L < MVP_L = P \times MP_L \quad (MR < P)` },
    ],
    points: [
      'Why labour demand slopes down: with capital fixed in the short run, each extra worker adds less output (diminishing marginal returns), so the value of their output falls.',
      'What shifts labour demand: the output price (it is derived demand), labour productivity (technology, more capital per worker, skills), and demand for the product.',
      'Only the downward-sloping part of MVP_L below the maximum of the average value product (P × AP_L) is demand: at a higher wage the firm would rather not operate.',
      'In real terms the rule is MP_L = w/P: hire until the marginal product equals the real wage.',
      'Market labour demand adds firms’ demand curves horizontally; it is steeper than the simple sum because when all firms hire more, output rises and the output price falls.',
      'With market power in the output market, MRP_L = MR × MP_L lies below MVP_L, so the firm hires fewer workers than is efficient.',
    ],
    tip: 'Derive labour demand in three steps: (1) MP_L falls with L; (2) multiply by the output price to get MVP_L in money; (3) set MVP_L = w and show that each wage picks a point on MVP_L, so MVP_L is the demand curve. Label it D_L = MVP_L and name the shift factors.',
  };

  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  const block = (window.TOPICS.find((t) => t.id === 'labour-market') || {}).block || 'Block 9';
  { const i = window.TOPICS.findIndex((t) => t.id === 'labour-market'); window.TOPICS.splice(i, 0, Object.assign(mvpDemand, { unit: MICRO, block })); }
  insertAfter('labour-market', monopsony, MICRO, block);
  insertAfter('monopsony', bilateralMonopoly, MICRO, block);
  insertAfter('bilateral-monopoly', wageDifferentials, MICRO, block);
  insertAfter('wage-differentials', humanCapital, MICRO, block);
  insertAfter('human-capital', tradeUnions, MICRO, block);
  insertAfter('trade-unions', efficiencyWages, MICRO, block);
  insertAfter('efficiency-wages', discrimination, MICRO, block);
  insertAfter('discrimination', labourPolicy, MICRO, block);
})();
