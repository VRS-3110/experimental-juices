/* Unemployment (Blocks 17–18): measurement, types and flows, and the natural rate in the
   wage-setting / price-setting model. Loads after labour.js and inserts both topics before the
   Phillips curve topic. */
(function () {
  const { R, f, money, pct, C, V, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
  const MACRO = 'Macroeconomics';

  /* ── Unemployment: stocks, flows and types ── */
  // Monthly flows: a share s of the employed lose their jobs, a share f of the unemployed find one.
  // u(t+1) = u(t) + j(1 − u(t)) − h·u(t); steady state u* = j/(j + h) (the guide's notation).
  const path = (s, months = 48) => {
    const sr = s.s / 100, fr = s.f / 100, out = [s.u0 / 100];
    for (let t = 0; t < months; t++) { const u = out[t]; out.push(u + sr * (1 - u) - fr * u); }
    return out;
  };
  const flowStats = (s) => {
    const sr = s.s / 100, fr = s.f / 100, ustar = sr / (sr + fr), p = path(s);
    const shrink = 1 - sr - fr, half = shrink > 0 && shrink < 1 ? Math.log(0.5) / Math.log(shrink) : 0;
    return { ustar, p, duration: 1 / fr, half, inflow: sr * (1 - ustar), u12: p[12] };
  };
  const typesTable = `
    <h2>Types of unemployment</h2>
    <p class="extra-lede">The natural rate is frictional plus structural unemployment. Cyclical unemployment is the gap between actual unemployment and the natural rate.</p>
    <div class="table-scroll"><table class="compare">
      <thead><tr><th>Type</th><th>Cause</th><th>Example</th><th>Policy response</th></tr></thead>
      <tbody>
        <tr><th>Frictional (search)</th><td>Time taken to match workers with vacancies</td><td>A graduate looking for a first job</td><td>Better information, job centres and online matching</td></tr>
        <tr><th>Structural</th><td>Mismatch of skills or location after the economy changes</td><td>Coal miners after pit closures</td><td>Retraining, help with moving, regional policy</td></tr>
        <tr><th>Seasonal</th><td>Regular changes in demand through the year</td><td>Seaside resort staff in winter</td><td>Usually none; data are seasonally adjusted</td></tr>
        <tr><th>Cyclical (demand-deficient)</th><td>Aggregate demand below potential output</td><td>Job losses in a recession</td><td>Fiscal and monetary stimulus</td></tr>
        <tr><th>Classical (real-wage)</th><td>Real wages held above the market-clearing level</td><td>A minimum wage or union wage above equilibrium</td><td>Labour market flexibility</td></tr>
      </tbody>
    </table></div>`;
  const unemployment = {
    id: 'unemployment',
    title: 'Unemployment: measurement, types and flows',
    summary: 'The unemployed are people without a job who are available for work and actively looking (the ILO definition). The unemployment rate is a stock, but behind it are large flows: every month some workers lose or leave jobs and some of the unemployed find work. The rate settles where the two flows balance, so anything that raises job separations or slows job finding raises unemployment.',
    model: 'Each month a share j of the employed lose their jobs and a share h of the unemployed are hired. Starting from u₀, unemployment follows u(t+1) = u(t) + j(1 − u(t)) − h·u(t) and settles at the steady state u* = j/(j + h), where inflows equal outflows (jE = hU).',
    graph: {
      x: { range: [0, 48], label: 'Months', ticks: range(0, 48, 6), fmt: (v) => String(v) },
      y: { range: [0, 20], label: 'Unemployment rate (%)', ticks: range(0, 20, 4), fmt: (v) => v + '%' },
      params: [
        { id: 's', label: 'Job-loss rate (j, % of employed a month)', min: 0.1, max: 6, step: 0.1, value: 1.5 },
        { id: 'f', label: 'Hiring rate (h, % of unemployed a month)', min: 1, max: 100, step: 1, value: 25 },
        { id: 'u0', label: 'Starting unemployment rate (%)', min: 0, max: 60, step: 0.5, value: 10 },
      ],
      valid(s) {
        return true;
      },
      draw(s) {
        const z = flowStats(s);
        return [
          Hl(100 * z.ustar, 'o', `Steady state u* = ${f(100 * z.ustar, 1)}%`, { dash: true }),
          C((t) => { const i = Math.floor(t), fr = t - i; return 100 * (z.p[i] + (z.p[Math.min(i + 1, z.p.length - 1)] - z.p[i]) * fr); }, 'd', 'Unemployment rate', { from: 0, to: 48, labelAt: 2 }),
          P(0, s.u0, '', 'd', { small: true }),
          G(12, 100 * z.u12, '12', null, 'n'),
          P(12, 100 * z.u12, 'After a year', 'n', { small: true, dx: 9, dy: z.u12 > z.ustar ? -8 : 16 }),
        ];
      },
      readout(s) {
        const z = flowStats(s);
        return {
          rows: [
            ['Steady-state rate u* = j/(j + h)', pct(100 * z.ustar, 2)],
            ['Unemployment after 12 months', pct(100 * z.u12, 2)],
            ['Average spell of unemployment (1/h)', `${f(z.duration, 1)} months`],
            ['Months to close half the gap to u*', f(z.half, 1)],
            ['Monthly inflow = outflow at u* (% of labour force)', pct(100 * z.inflow, 2)],
          ],
          status: Math.abs(s.u0 / 100 - z.ustar) < 0.002
            ? 'Unemployment starts at its steady state: inflows and outflows already balance.'
            : s.u0 / 100 > z.ustar
              ? `More people find jobs each month than lose them, so unemployment falls toward ${pct(100 * z.ustar, 1)}. Raising the hiring rate h (better matching) or cutting the job-loss rate j lowers the steady state.`
              : `More people lose jobs each month than find them, so unemployment rises toward ${pct(100 * z.ustar, 1)}.`,
          tone: 'info',
        };
      },
    },
    extra: typesTable,
    equations: [
      { name: 'Unemployment rate', tex: R`u = \frac{U}{U + E} \times 100`, note: 'U: unemployed (no job, available, actively seeking). E: employed. U + E is the labour force.' },
      { name: 'Working-age population', tex: R`P = LF + NLF, \qquad LF = E + U`, note: 'NLF: people not in the labour force, the inactive (students, carers, the retired, the long-term sick, discouraged workers). As in the guide (Block 18).' },
      { name: 'Employment, participation and inactivity rates', tex: R`e = \frac{E}{P}, \qquad lfp = \frac{LF}{P}, \qquad \text{inactivity rate} = \frac{NLF}{P} = 1 - lfp`, note: 'These divide by the working-age population P; only the unemployment rate divides by the labour force.' },
      { name: 'Stock–flow dynamics', tex: R`\Delta U = jE - hU` },
      { name: 'Steady-state unemployment', tex: R`jE = hU \;\Rightarrow\; u^* = \frac{j}{j + h}`, note: 'j: job-loss rate. h: hiring rate. As in the guide.' },
      { name: 'Average duration of a spell', tex: R`\text{duration} \approx \frac{1}{h}` },
    ],
    points: [
      'Two UK measures: the Labour Force Survey uses the ILO definition (no job, available, looked in the last four weeks); the claimant count covers people claiming unemployment-related benefits. The LFS measure is usually higher.',
      'The rate understates slack: discouraged workers leave the labour force, and part-time workers who want more hours count as employed (underemployment).',
      'Costs of unemployment: lost output (below potential), lost income and tax revenue, higher benefit spending, loss of skills, and worse health and wellbeing.',
      'Long-term unemployment (over a year) matters most: skills and motivation decay, so the job-finding rate falls the longer people are out of work.',
      'Hysteresis: a long recession can raise the natural rate itself, because the long-term unemployed become less employable.',
    ],
    tip: 'Use the ILO definition and the formula u = U/(U + E). When asked about causes, classify the unemployment (frictional, structural, cyclical) and match each type to its policy: matching for frictional, retraining for structural, demand management for cyclical.',
  };

  /* ── The natural rate (WS–PS model) ── */
  // Wage setting: the real wage workers can secure rises as unemployment falls: w = z − c·u (u in %).
  // Price setting: firms' mark-up μ over unit labour costs fixes the real wage they will pay: w = A/(1 + μ).
  // Equilibrium (natural) unemployment where they meet: u* = (z − A/(1 + μ))/c.
  const WC = 0.5;
  const ws = (s) => {
    const wPS = s.A / (1 + s.mu), ustar = (s.z - wPS) / WC;
    const wsAt = (u) => s.z - WC * u, gap = wsAt(s.u) - wPS;
    return { wPS, ustar, Nstar: 100 - ustar, wsAt, gap };
  };
  const naturalRate = {
    id: 'natural-rate',
    title: 'The natural rate of unemployment (WS–PS)',
    summary: 'The natural rate of unemployment (or NAIRU) is the rate at which the real wage workers can bargain for is exactly the real wage firms are willing to pay. Below it, workers push for higher pay than firms will grant, firms raise prices to protect their margins, and inflation rises. The natural rate depends on supply-side features of the economy, not on aggregate demand.',
    model: 'Employment N is measured as a percentage of a labour force of 100, so unemployment u = 100 − N. Wage setting (WS): the real wage workers can secure, w = z − 0.5u, rises as unemployment falls; z captures wage-push factors (benefits, union power, employment protection). Price setting (PS): firms set prices as a mark-up μ on labour costs, so the real wage they will pay is w = A/(1 + μ), where A is labour productivity.',
    graph: {
      x: { range: [70, 100], label: 'Employment N (% of labour force)', ticks: range(70, 100, 5), fmt: (v) => String(v) },
      y: { range: [0, 16], label: 'Real wage (w/P)', ticks: range(0, 16, 2) },
      params: [
        { id: 'z', label: 'Wage-push factors (z)', min: 8, max: 40, step: 0.1, value: 12 },
        { id: 'mu', label: 'Price mark-up (μ)', min: 0, max: 3, step: 0.01, value: 0.25 },
        { id: 'A', label: 'Labour productivity (A)', min: 1, max: 15, step: 0.1, value: 10 },
        { id: 'u', label: 'Actual unemployment (%)', min: 0.5, max: 60, step: 0.1, value: 8 },
      ],
      valid(s) {
        const z = ws(s);
        if (z.ustar < 0.5) return 'The natural rate would fall below zero: firms would pay more than workers demand even at full employment.';
        if (z.ustar > 95) return 'Almost no one would be employed at the natural rate: wage claims could never be met.';
        return true;
      },
      draw(s) {
        const z = ws(s), N = 100 - s.u, out = [];
        if (Math.abs(z.gap) > 0.05) out.push(S(N, z.wPS, N, z.wsAt(s.u), z.gap > 0 ? 'r' : 'g', '', { bold: true }));
        out.push(
          C((n) => z.wsAt(100 - n), 'd', 'WS', { from: 70, to: 100, labelAt: 81 }),
          Hl(z.wPS, 's', 'PS = A/(1 + μ)', { labelLeft: true }),
          V(100, 'ghost', ''),
          T(99.5, 15.2, 'Labour force', 'n', { anchor: 'end' }),
          G(z.Nstar, z.wPS, 'N*', null, 'o'),
          P(z.Nstar, z.wPS, 'Natural rate', 'o', { dx: -9, dy: -10 }),
        );
        if (Math.abs(s.u - z.ustar) > 0.05) out.push(V(N, 'ghost', ''), P(N, z.wsAt(s.u), 'Actual', 'n', { small: true, dx: 9, dy: z.gap > 0 ? -8 : 16 }));
        if (z.ustar > 2) out.push(S(z.Nstar, 1.2, 100, 1.2, 'o', '', { bold: true }), T((z.Nstar + 100) / 2, 1.8, 'u*', 'o', { anchor: 'middle' }));
        return out;
      },
      readout(s) {
        const z = ws(s), cyc = s.u - z.ustar;
        return {
          rows: [
            ['Natural rate u*', pct(z.ustar, 2)],
            ['Real wage at u* (= PS)', f(z.wPS)],
            ['Actual unemployment', pct(s.u, 1)],
            ['Cyclical unemployment u − u*', `${cyc >= 0 ? '' : '−'}${pct(Math.abs(cyc), 2)}`],
            ['Wage claims minus what firms pay (at actual u)', `${z.gap >= 0 ? '+' : '−'}${f(Math.abs(z.gap))}`],
          ],
          status: Math.abs(cyc) < 0.05
            ? 'At the natural rate: wage claims match the real wage firms will pay, so inflation is stable.'
            : cyc < 0
              ? `Unemployment is below the natural rate, so workers bargain for a higher real wage than firms will pay. Firms pass higher wages on in prices, and inflation rises: the economy is above the long-run Phillips curve point.`
              : `Unemployment is above the natural rate, so wage claims are below what firms would pay. Wage and price pressure eases and inflation falls.`,
          tone: Math.abs(cyc) < 0.05 ? 'good' : cyc < 0 ? 'warn' : 'info',
        };
      },
    },
    equations: [
      { name: 'Wage-setting curve', tex: R`\frac{w}{P} = z - c\,u`, note: 'Lower unemployment strengthens workers’ bargaining position. z: benefits, union power, employment protection.' },
      { name: 'Price-setting curve', tex: R`\frac{w}{P} = \frac{A}{1 + \mu}`, note: 'Firms charge a mark-up μ over unit labour costs; A is labour productivity.' },
      { name: 'Natural rate', tex: R`z - c\,u^* = \frac{A}{1 + \mu} \;\Rightarrow\; u^* = \frac{1}{c}\Big(z - \frac{A}{1 + \mu}\Big)` },
      { name: 'Link to the Phillips curve', tex: R`\pi = \pi^e - b\,(u - u^*)`, note: 'Inflation rises when u < u* and falls when u > u*.' },
    ],
    points: [
      'The natural rate is not zero: it includes frictional and structural unemployment, and in the WS–PS model the unemployment needed to keep wage claims in line with what firms can pay.',
      'It falls with more competition in product markets (lower μ), higher productivity (higher A), lower wage-push (less generous or more conditional benefits, weaker union power), and better job matching.',
      'It is independent of aggregate demand in the long run: demand policy can move actual unemployment away from u* only temporarily, at the cost of changing inflation.',
      'Supply-side policies lower the natural rate: training, competition policy, labour market reforms, and help with job search and mobility.',
      'Hysteresis: if long recessions erode skills and attachment to work, the natural rate itself can rise after a downturn.',
      'Estimates of the UK NAIRU fell from about 10% in the 1980s to around 4–5% before the pandemic.',
    ],
    tip: 'Draw WS rising with employment and PS flat; the gap between their intersection and the labour force is the natural rate. Then show a shift: higher z or μ moves the intersection left and raises u*. Connect it to the vertical long-run Phillips curve.',
  };

  const insertBefore = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i, 0, Object.assign(topic, { unit, block }));
  };
  const block = (window.TOPICS.find((t) => t.id === 'phillips') || {}).block || 'Blocks 17–18';
  insertBefore('phillips', unemployment, MACRO, block);
  insertBefore('phillips', naturalRate, MACRO, block);
})();
