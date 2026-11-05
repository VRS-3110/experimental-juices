/* Practice quiz built on the worked answers.
   Calculation questions are generators: each call picks new numbers, so the quiz tests
   the method, not memory of the example. Concept questions are fixed multiple choice.
   Every item names the worked answer it tests (worked: id). */
(function () {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const int = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const n = (v, dp = 2) => String(+(+v).toFixed(dp)); // trim trailing zeros
  const money = (v) => (v < 0 ? '−' : '') + n(Math.abs(v));
  // A linear direct function written the way the guide writes it: Q = a − bP.
  const lin = (lhs, a, b, v = 'P') => `${lhs} = ${a < 0 ? '−' + Math.abs(a) : a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}${v}`;

  // Market with clean equilibrium: Q_D = a − bP, Q_S = c + dP, equilibrium (P*, Q*) chosen first.
  const market = (b, d) => {
    const P = int(4, 9), Q = pick([30, 40, 50, 60]);
    return { a: Q + b * P, b, c: Q - d * P, d, P, Q };
  };

  const generators = [
    {
      worked: 'w-comparative-advantage', topic: 'ppf',
      gen() {
        const [ac, at] = pick([[10, 5], [12, 4], [8, 4], [9, 3]]);
        const [bc, bt] = pick([[6, 2], [6, 3], [10, 2], [4, 2]]).map((x) => x);
        const ocA = at / ac, ocB = bt / bc;
        if (Math.abs(ocA - ocB) < 1e-9) return this.gen();
        const cheaper = ocA < ocB ? 0 : 1;
        return {
          q: `In a day a worker in A makes ${ac} cloth or ${at} tea; a worker in B makes ${bc} cloth or ${bt} tea.`,
          parts: [
            { label: 'Opportunity cost of 1 cloth in A (units of tea)', answer: ocA },
            { label: 'Opportunity cost of 1 cloth in B (units of tea)', answer: ocB },
            { label: 'Which country should specialise in cloth?', choices: ['A', 'B'], correct: cheaper },
          ],
          solution: [
            `OC of cloth = tea given up ÷ cloth gained: A = ${at}/${ac} = ${n(ocA)}, B = ${bt}/${bc} = ${n(ocB)}.`,
            `The lower opportunity cost is ${cheaper ? 'B' : 'A'}, so ${cheaper ? 'B' : 'A'} has the comparative advantage in cloth.`,
          ],
        };
      },
    },
    {
      worked: 'w-equilibrium-surplus', topic: 'supply-demand',
      gen() {
        const m = market(pick([2, 5, 10]), pick([5, 10]));
        const cs = (m.Q * m.Q) / (2 * m.b);
        return {
          q: `${lin('Q_D', m.a, -m.b)} and ${lin('Q_S', m.c, m.d)}.`,
          parts: [
            { label: 'Equilibrium price P*', answer: m.P },
            { label: 'Equilibrium quantity Q*', answer: m.Q },
            { label: 'Consumer surplus', answer: cs },
          ],
          solution: [
            `Set Q_D = Q_S: ${m.a} − ${m.b}P = ${m.c} + ${m.d}P → ${m.a - m.c} = ${m.b + m.d}P → P* = ${m.P}.`,
            `Q* = ${m.a} − ${m.b}(${m.P}) = ${m.Q}.`,
            `Choke price = ${m.a}/${m.b} = ${n(m.a / m.b)}. CS = ½ × (${n(m.a / m.b)} − ${m.P}) × ${m.Q} = ${n(cs)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-price-ceiling', topic: 'price-controls',
      gen() {
        const d = pick([5, 10]), m = market(pick([5, 10]), d);
        const k = int(1, 3), pc = m.P - k, qs = m.Q - d * k, qd = m.Q + m.b * k;
        if (qs <= 0) return this.gen();
        return {
          q: `${lin('Q_D', m.a, -m.b)}, ${lin('Q_S', m.c, m.d)} (equilibrium P = ${m.P}). A price ceiling is set at ${pc}.`,
          parts: [
            { label: 'Shortage', answer: qd - qs },
            { label: 'Quantity actually traded', answer: qs },
          ],
          solution: [
            `At P = ${pc}: Q_D = ${m.a} − ${m.b}(${pc}) = ${qd}; Q_S = ${m.c} + ${m.d}(${pc}) = ${qs}.`,
            `Shortage = ${qd} − ${qs} = ${qd - qs}. The short side decides trade, so ${qs} units are traded.`,
          ],
        };
      },
    },
    {
      worked: 'w-elasticity', topic: 'elasticity',
      gen() {
        const a = pick([60, 80, 100, 120]), b = pick([2, 4, 5, 10]);
        const P = int(1, Math.floor(a / b) - 1), Q = a - b * P, ped = (-b * P) / Q;
        return {
          q: `Demand is ${lin('Q', a, -b)}.`,
          parts: [
            { label: `Point price elasticity of demand at P = ${P}`, answer: ped },
            { label: 'At that price, is demand…', choices: ['Elastic', 'Unit elastic', 'Inelastic'], correct: Math.abs(ped) > 1.0001 ? 0 : Math.abs(ped) < 0.9999 ? 2 : 1 },
            { label: 'Revenue-maximising price', answer: a / (2 * b) },
          ],
          solution: [
            `At P = ${P}, Q = ${a} − ${b}(${P}) = ${Q}. PED = (dQ/dP)(P/Q) = −${b} × ${P}/${Q} = ${n(ped)}.`,
            `|PED| ${Math.abs(ped) > 1 ? '> 1: elastic' : Math.abs(ped) < 1 ? '< 1: inelastic' : '= 1: unit elastic'}.`,
            `Revenue peaks where |PED| = 1, at the midpoint of linear demand: P = ${a}/(2 × ${b}) = ${n(a / (2 * b))}.`,
          ],
        };
      },
    },
    {
      worked: 'w-specific-tax', topic: 'tax-incidence',
      gen() {
        const [b, d] = pick([[5, 5], [10, 10], [5, 20], [20, 5]]), m = market(b, d);
        const t = pick([1, 2, 3]), dq = (t * b * d) / (b + d), qt = m.Q - dq;
        if (qt <= 0) return this.gen();
        const pb = m.P + (t * d) / (b + d);
        return {
          q: `${lin('Q_D', m.a, -m.b)} and ${lin('Q_S', m.c, m.d)} (equilibrium P = ${m.P}, Q = ${m.Q}). A specific tax of ${t} per unit is imposed on sellers.`,
          parts: [
            { label: 'New quantity traded Q_t', answer: qt },
            { label: 'Price buyers pay P_b', answer: pb },
            { label: 'Tax revenue', answer: t * qt },
            { label: 'Deadweight loss', answer: 0.5 * t * dq },
          ],
          solution: [
            `The tax shifts supply up by ${t}. Solve ${m.a} − ${m.b}P_b = ${m.c} + ${m.d}(P_b − ${t}): P_b = ${n(pb)}, P_s = ${n(pb - t)}.`,
            `Q_t = ${m.a} − ${m.b}(${n(pb)}) = ${n(qt)}.`,
            `Revenue = ${t} × ${n(qt)} = ${n(t * qt)}. DWL = ½ × ${t} × (${m.Q} − ${n(qt)}) = ${n(0.5 * t * dq)}.`,
            `Buyers bear ${n(pb - m.P)} of the ${t}: the share d/(b + d) = ${d}/${b + d}.`,
          ],
        };
      },
    },
    {
      worked: 'w-consumer-optimum', topic: 'consumer-choice',
      gen() {
        const al = pick([0.25, 0.5, 0.75]), M = pick([60, 80, 100, 120]), px = pick([2, 4, 5]), py = pick([2, 5, 10]);
        return {
          q: `U = X^{${al}}Y^{${1 - al}}, income M = ${M}, P_X = ${px}, P_Y = ${py}.`,
          parts: [
            { label: 'Optimal X*', answer: (al * M) / px },
            { label: 'Optimal Y*', answer: ((1 - al) * M) / py },
          ],
          solution: [
            `Tangency MU_X/MU_Y = P_X/P_Y gives (${al}/${1 - al})(Y/X) = ${px}/${py}.`,
            `With Cobb–Douglas, spending shares equal the exponents: X* = ${al} × ${M}/${px} = ${n((al * M) / px)}, Y* = ${1 - al} × ${M}/${py} = ${n(((1 - al) * M) / py)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-slutsky', topic: 'income-substitution',
      gen() {
        const M = pick([80, 120, 160]), p0 = pick([2, 4]), p1 = 4 * p0, py = pick([2, 4, 5]);
        const x0 = M / (2 * p0), x1 = M / (2 * p1), xc = x0 / 2;
        return {
          q: `U = X^{0.5}Y^{0.5}, M = ${M}, P_Y = ${py}. P_X rises from ${p0} to ${p1}.`,
          parts: [
            { label: 'Total change in X', answer: x1 - x0 },
            { label: 'Substitution effect (Hicks)', answer: xc - x0 },
            { label: 'Income effect', answer: x1 - xc },
          ],
          solution: [
            `Before: X₀ = 0.5 × ${M}/${p0} = ${n(x0)}. After: X₁ = 0.5 × ${M}/${p1} = ${n(x1)}. Total = ${n(x1 - x0)}.`,
            `Stay on U₀ at the new price ratio. The tangency gives Y/X = P_X/P_Y, so X′ = X₀ × √(P_X⁰/P_X¹) = ${n(x0)} × √(1/4) = ${n(xc)}.`,
            `SE = ${n(xc)} − ${n(x0)} = ${n(xc - x0)}. IE = ${n(x1)} − ${n(xc)} = ${n(x1 - xc)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-cost-min', topic: 'isoquant',
      gen() {
        const [w, r] = pick([[4, 16], [16, 4], [9, 1], [1, 9], [2, 8], [8, 2], [4, 4]]), Q = pick([10, 20, 30]);
        const L = Q * Math.sqrt(r / w), K = Q * Math.sqrt(w / r);
        return {
          q: `Q = L^{0.5}K^{0.5}, wage w = ${w}, rental rate r = ${r}. Produce Q = ${Q} at least cost.`,
          parts: [
            { label: 'Labour L', answer: L },
            { label: 'Capital K', answer: K },
            { label: 'Minimum cost', answer: w * L + r * K },
          ],
          solution: [
            `MP_L/MP_K = K/L = w/r = ${w}/${r}, so K = ${n(w / r)}L.`,
            `${Q} = √(L × ${n(w / r)}L) → L = ${n(L)}, K = ${n(K)}.`,
            `Cost = ${w}(${n(L)}) + ${r}(${n(K)}) = ${n(w * L + r * K)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-perfect-competition', topic: 'costs',
      gen() {
        const F = pick([16, 36, 64, 100]), c = pick([2, 4, 6]), q = int(Math.sqrt(F) + 2, Math.sqrt(F) + 8), P = c + 2 * q;
        const profit = P * q - (F + c * q + q * q), be = 2 * Math.sqrt(F) + c;
        return {
          q: `A price-taking firm has TC = ${F} + ${c}Q + Q². The market price is ${P}.`,
          parts: [
            { label: 'Profit-maximising output', answer: q },
            { label: 'Profit', answer: profit },
            { label: 'Break-even price (min ATC)', answer: be },
          ],
          solution: [
            `MC = ${c} + 2Q. Set P = MC: ${P} = ${c} + 2Q → Q = ${q}.`,
            `Profit = ${P}(${q}) − (${F} + ${c}(${q}) + ${q}²) = ${P * q} − ${F + c * q + q * q} = ${profit}.`,
            `ATC = ${F}/Q + ${c} + Q is lowest where ${F}/Q² = 1 → Q = ${Math.sqrt(F)}, ATC = ${n(be)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-monopoly', topic: 'monopoly',
      gen() {
        const b = pick([1, 2]), mc = pick([10, 20]), a = pick([60, 80, 100, 120]);
        const qm = (a - mc) / (2 * b), pm = (a + mc) / 2, qc = (a - mc) / b;
        return {
          q: `A monopolist faces P = ${a} − ${b === 1 ? '' : b}Q with constant MC = ${mc} and no fixed cost.`,
          parts: [
            { label: 'Output', answer: qm },
            { label: 'Price', answer: pm },
            { label: 'Profit', answer: (pm - mc) * qm },
            { label: 'Deadweight loss', answer: 0.5 * (pm - mc) * (qc - qm) },
          ],
          solution: [
            `MR = ${a} − ${2 * b}Q. MR = MC: Q = (${a} − ${mc})/${2 * b} = ${n(qm)}.`,
            `Price from demand: P = ${a} − ${b}(${n(qm)}) = ${n(pm)}. Profit = (${n(pm)} − ${mc}) × ${n(qm)} = ${n((pm - mc) * qm)}.`,
            `Competitive output P = MC: Q = ${n(qc)}. DWL = ½ × (${n(pm)} − ${mc}) × (${n(qc)} − ${n(qm)}) = ${n(0.5 * (pm - mc) * (qc - qm))}.`,
          ],
        };
      },
    },
    {
      worked: 'w-natural-monopoly', topic: 'natural-monopoly',
      gen() {
        const F = pick([18, 32, 42, 48]), root = Math.sqrt(100 - 2 * F), q = 10 + root, p = 12 - 0.5 * q;
        return {
          q: `A natural monopoly faces P = 12 − 0.5Q with MC = 2 and fixed cost F = ${F}.`,
          parts: [
            { label: 'Output under average-cost pricing', answer: q },
            { label: 'Price under average-cost pricing', answer: p },
            { label: 'Subsidy needed under marginal-cost pricing', answer: F },
          ],
          solution: [
            `P = AC: 12 − 0.5Q = 2 + ${F}/Q → 0.5Q² − 10Q + ${F} = 0 → Q = 10 ± ${n(root)}. Take the larger root: Q = ${n(q)}.`,
            `P = 12 − 0.5(${n(q)}) = ${n(p)}.`,
            `Under P = MC = 2 every unit earns zero margin, so the loss is the whole fixed cost: ${F}.`,
          ],
        };
      },
    },
    {
      worked: 'w-cournot', topic: 'cournot',
      gen() {
        const c = pick([10, 20, 30]), a = c + 3 * int(15, 40), q = (a - c) / 3, p = a - 2 * q;
        return {
          q: `Two Cournot firms face P = ${a} − Q, where Q = q_A + q_B. Both have MC = ${c}.`,
          parts: [
            { label: 'Output of each firm', answer: q },
            { label: 'Market price', answer: p },
            { label: 'Profit of each firm', answer: (p - c) * q },
          ],
          solution: [
            `MR_A = ${a} − 2q_A − q_B = ${c} → reaction function q_A = (${a - c} − q_B)/2.`,
            `By symmetry q = (${a - c} − q)/2 → q = ${n(q)}. Q = ${n(2 * q)}, P = ${n(p)}.`,
            `Profit each = (${n(p)} − ${c}) × ${n(q)} = ${n((p - c) * q)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-labour-mrp', topic: 'labour-market',
      gen() {
        const A = pick([20, 24, 30]), P = pick([2, 4, 5]), L = int(4, A - 4), w = P * (A - L);
        return {
          q: `A competitive firm has Q = ${A}L − 0.5L². The output price is ${P} and the wage is ${w}.`,
          parts: [{ label: 'Workers hired', answer: L }],
          solution: [`MP_L = ${A} − L. MRP_L = ${P}(${A} − L). Set MRP_L = w: ${P}(${A} − L) = ${w} → L = ${L}.`],
        };
      },
    },
    {
      worked: 'w-externality', topic: 'externalities',
      gen() {
        const c = pick([10, 20]), e = pick([10, 20, 30]), A = c + e + 2 * int(10, 30);
        const qm = (A - c) / 2, qs = (A - c - e) / 2;
        return {
          q: `Demand (= MSB) is P = ${A} − Q. Marginal private cost is MPC = ${c} + Q. Each unit causes external damage of ${e}.`,
          parts: [
            { label: 'Market output', answer: qm },
            { label: 'Efficient output', answer: qs },
            { label: 'Deadweight loss of the free market', answer: 0.5 * e * (qm - qs) },
          ],
          solution: [
            `Market: ${A} − Q = ${c} + Q → Q = ${n(qm)}.`,
            `MSC = ${c + e} + Q. Efficient: ${A} − Q = ${c + e} + Q → Q = ${n(qs)}. A Pigouvian tax of ${e} gets there.`,
            `DWL = ½ × ${e} × (${n(qm)} − ${n(qs)}) = ${n(0.5 * e * (qm - qs))}.`,
          ],
        };
      },
    },
    {
      worked: 'w-tariff', topic: 'tariff',
      gen() {
        const m = market(10, 10), pw = m.P - 3, t = pick([1, 2]);
        const before = 20 * (m.P - pw), after = 20 * (m.P - pw - t);
        return {
          q: `Domestic ${lin('Q_D', m.a, -10)} and ${lin('Q_S', m.c, 10)}. The world price is ${pw} and a tariff of ${t} per unit is imposed.`,
          parts: [
            { label: 'Imports before the tariff', answer: before },
            { label: 'Imports after the tariff', answer: after },
            { label: 'Tariff revenue', answer: t * after },
            { label: 'Deadweight loss', answer: 10 * t * t },
          ],
          solution: [
            `At P = ${pw}: Q_D = ${m.a - 10 * pw}, Q_S = ${m.c + 10 * pw}, imports = ${before}.`,
            `At P = ${pw + t}: Q_D = ${m.a - 10 * (pw + t)}, Q_S = ${m.c + 10 * (pw + t)}, imports = ${after}.`,
            `Revenue = ${t} × ${after} = ${t * after}. DWL = two triangles, each ½ × ${t} × ${10 * t} = ${5 * t * t}, total ${10 * t * t}.`,
          ],
        };
      },
    },
    {
      worked: 'w-gdp', topic: 'national-income',
      gen() {
        const C = pick([500, 600, 700]), I = pick([100, 150, 200]), G = pick([150, 200, 250]), X = pick([80, 120, 160]), Z = pick([100, 150, 200]), NT = pick([150, 180, 220]);
        const Y = C + I + G + X - Z;
        return {
          q: `C = ${C}, I = ${I}, G = ${G}, X = ${X}, Z = ${Z}, net taxes NT = ${NT}.`,
          parts: [
            { label: 'GDP', answer: Y },
            { label: 'Household saving S', answer: Y - NT - C },
          ],
          solution: [
            `Y = C + I + G + (X − Z) = ${C} + ${I} + ${G} + (${X} − ${Z}) = ${Y}.`,
            `Y_d = ${Y} − ${NT} = ${Y - NT}. S = Y_d − C = ${Y - NT - C}.`,
            `Check: S + NT + Z = ${Y - NT - C + NT + Z} = I + G + X = ${I + G + X}.`,
          ],
        };
      },
    },
    {
      worked: 'w-multiplier', topic: 'keynesian-cross',
      gen() {
        const [c, t, z] = pick([[0.8, 0.25, 0.1], [0.75, 0.2, 0.1], [0.9, 0.2, 0.12], [0.8, 0.2, 0.14]]);
        const k = 1 / (1 - c * (1 - t) + z), A = pick([300, 400, 430, 500]), dG = pick([10, 20, 50]);
        return {
          q: `C = ${c}Y_d plus autonomous spending, tax rate t = ${t}, marginal propensity to import z = ${z}. Total autonomous spending is ${A}.`,
          parts: [
            { label: 'Multiplier K', answer: k },
            { label: 'Equilibrium income Y*', answer: A * k },
            { label: `Change in Y if G rises by ${dG}`, answer: dG * k },
          ],
          solution: [
            `K = 1/[1 − c(1 − t) + z] = 1/[1 − ${c}(${1 - t}) + ${z}] = 1/${n(1 - c * (1 - t) + z, 3)} = ${n(k)}.`,
            `Y* = K × autonomous spending = ${n(k)} × ${A} = ${n(A * k)}.`,
            `ΔY = K × ΔG = ${n(k)} × ${dG} = ${n(dG * k)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-solow', topic: 'solow',
      gen() {
        const [s, nd] = pick([[0.2, 0.05], [0.3, 0.1], [0.4, 0.05], [0.3, 0.05], [0.2, 0.1]]), root = s / nd;
        return {
          q: `y = k^{0.5}, saving rate s = ${s}, n + d = ${nd}, no technical progress.`,
          parts: [
            { label: 'Steady-state capital k*', answer: root * root },
            { label: 'Steady-state output y*', answer: root },
            { label: 'Steady-state consumption c*', answer: (1 - s) * root },
          ],
          solution: [
            `s·k^{0.5} = (n + d)k → k^{0.5} = s/(n + d) = ${n(root)}.`,
            `k* = ${n(root * root)}, y* = ${n(root)}, c* = (1 − ${s}) × ${n(root)} = ${n((1 - s) * root)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-ismp', topic: 'is-mp',
      gen() {
        const c = pick([0.75, 0.8]), C0 = pick([100, 150]), T = 100, I0 = pick([200, 250]), h = pick([10, 20]), G = pick([150, 200]), r = int(2, 6), dG = pick([20, 25, 50]);
        const k = 1 / (1 - c), Y = k * (C0 - c * T + I0 + G - h * r);
        return {
          q: `C = ${C0} + ${c}(Y − T), T = ${T}, I = ${I0} − ${h}r, G = ${G}. The central bank sets r = ${r}.`,
          parts: [
            { label: 'Equilibrium output Y', answer: Y },
            { label: `Change in Y if G rises by ${dG} (r held at ${r})`, answer: k * dG },
          ],
          solution: [
            `Y = ${C0} + ${c}(Y − ${T}) + ${I0} − ${h}r + ${G} → ${n(1 - c)}Y = ${n(C0 - c * T + I0 + G)} − ${h}r.`,
            `IS: Y = ${n(k * (C0 - c * T + I0 + G))} − ${n(k * h)}r. At r = ${r}: Y = ${n(Y)}.`,
            `With MP flat, ΔY = ΔG/(1 − c) = ${dG} × ${n(k)} = ${n(k * dG)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-phillips-taylor', topic: 'adas-phillips',
      gen() {
        const pe = int(1, 4), beta = pick([0.5, 1]), u = pick([3, 4, 6, 7]), us = 5;
        const pi = pe - beta * (u - us), gap = -2 * (u - us), r = 2 + 0.5 * (pi - 2) + 0.5 * gap;
        return {
          q: `π = πᵉ − ${beta}(u − 5) with πᵉ = ${pe}. Unemployment is ${u}%. Okun: gap = −2(u − u*). Taylor rule: r = 2 + 0.5(π − 2) + 0.5·gap.`,
          parts: [
            { label: 'Inflation π (%)', answer: pi },
            { label: 'Output gap (%)', answer: gap },
            { label: 'Taylor-rule real rate r (%)', answer: r },
          ],
          solution: [
            `π = ${pe} − ${beta}(${u} − 5) = ${n(pi)}.`,
            `Gap = −2(${u} − 5) = ${gap}%.`,
            `r = 2 + 0.5(${n(pi)} − 2) + 0.5(${gap}) = ${n(r)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-exchange-rate', topic: 'forex',
      gen() {
        const e = pick([1.2, 1.25, 1.5]), P = 100, Ps = pick([100, 110, 120, 140]), pi = int(2, 6), pis = int(1, 4);
        return {
          q: `e = ${e} dollars per pound. A basket costs £${P} in the UK and $${Ps} in the US. UK inflation is ${pi}%, US inflation ${pis}%.`,
          parts: [
            { label: 'Real exchange rate e·P/P*', answer: (e * P) / Ps },
            { label: 'PPP exchange rate (dollars per pound)', answer: Ps / P },
            { label: 'Predicted % change in e (relative PPP)', answer: pis - pi },
          ],
          solution: [
            `RER = ${e} × ${P}/${Ps} = ${n((e * P) / Ps, 3)}.`,
            `PPP: e = P*/P = ${Ps}/${P} = ${n(Ps / P)}.`,
            `%Δe ≈ π* − π = ${pis} − ${pi} = ${pis - pi}%${pis - pi < 0 ? ' (the pound depreciates)' : pis - pi > 0 ? ' (the pound appreciates)' : ''}.`,
          ],
        };
      },
    },
  ];

  const concepts = [
    { worked: 'w-oil-shock', topic: 'ad-as', q: 'A large rise in the price of oil, starting from long-run equilibrium, in the short run causes…', choices: ['Higher prices and higher output', 'Higher prices and lower output (stagflation)', 'Lower prices and lower output', 'No change, because LRAS is vertical'], correct: 1, why: 'An adverse supply shock shifts SRAS up/left along a fixed AD: the price level rises while output falls.' },
    { worked: 'w-oil-shock', topic: 'ad-as', q: 'Why does an adverse supply shock pose a dilemma for the central bank?', choices: ['It cannot change interest rates after a supply shock', 'Stimulating output adds to inflation, while fighting inflation deepens the recession', 'Supply shocks only affect the long run', 'Fiscal policy automatically offsets it'], correct: 1, why: 'One instrument cannot move output up and inflation down at the same time when SRAS has shifted.' },
    { worked: 'w-shutdown', topic: 'costs', q: 'A competitive firm’s price is above minimum AVC but below minimum ATC. In the short run it should…', choices: ['Shut down immediately', 'Keep producing where P = MC', 'Raise its price to ATC', 'Produce where ATC is lowest'], correct: 1, why: 'Revenue covers variable cost and part of fixed cost, so the loss is smaller than the fixed cost it would lose by closing.' },
    { worked: 'w-shutdown', topic: 'costs', q: 'The short-run shutdown price of a perfectly competitive firm is…', choices: ['Minimum ATC', 'Minimum AVC', 'Minimum MC', 'Average fixed cost'], correct: 1, why: 'Below minimum AVC, producing loses more than fixed cost.' },
    { worked: 'w-fiscal-regimes', topic: 'money-ismp', q: 'The central bank holds the interest rate fixed (flat MP). Government spending rises. Which is true?', choices: ['Output rises by the full multiplier and there is no crowding out', 'Output is unchanged because of full crowding out', 'The interest rate rises and investment falls', 'The money supply must fall'], correct: 0, why: 'To hold r, the bank expands the money supply as money demand rises, so investment is not crowded out.' },
    { worked: 'w-fiscal-regimes', topic: 'money-ismp', q: 'With a fixed money supply (an upward-sloping LM), a fiscal expansion…', choices: ['Lowers the interest rate', 'Raises output by more than the multiplier', 'Raises the interest rate, partly crowding out investment', 'Has no effect on money demand'], correct: 2, why: 'Higher income raises money demand; with M/P fixed, r must rise, reducing investment.' },
    { worked: 'w-minimum-wage', topic: 'labour-market', q: 'In a competitive labour market a minimum wage above the market wage will…', choices: ['Raise employment', 'Reduce employment and create unemployment', 'Have no effect', 'Lower the wage'], correct: 1, why: 'Firms move up their MRP curves and hire fewer workers, while more people want to work.' },
    { worked: 'w-minimum-wage', topic: 'labour-market', q: 'Under monopsony, a minimum wage set between the monopsony wage and the competitive wage can…', choices: ['Only reduce employment', 'Raise both the wage and employment', 'Cause the firm to shut down', 'Leave the wage unchanged'], correct: 1, why: 'It flattens the firm’s marginal factor cost, so hiring more no longer raises the wage it pays to everyone.' },
    { worked: 'w-specific-tax', topic: 'tax-incidence', q: 'Demand is very inelastic and supply is elastic. Who bears most of a per-unit tax?', choices: ['Sellers', 'Buyers', 'It is always split equally', 'Whoever is legally liable'], correct: 1, why: 'The less elastic side bears more: the buyers’ share is E_s/(E_s + |E_d|).' },
    { worked: 'w-comparative-advantage', topic: 'ppf', q: 'A country should specialise in the good for which it has…', choices: ['The highest output per worker', 'The lowest opportunity cost', 'The highest price', 'An absolute advantage'], correct: 1, why: 'Comparative advantage, the lower opportunity cost, determines the gains from specialisation.' },
    { worked: 'w-multiplier', topic: 'keynesian-cross', q: 'Full-employment output is 1,000, equilibrium is 860 and the multiplier is 2. The deflationary gap is…', choices: ['140', '70', '280', '1,000'], correct: 1, why: 'The deflationary gap is the shortfall of AD at Y_f: 140 ÷ 2 = 70. The 140 is the output gap.' },
    { worked: 'w-monopoly', topic: 'monopoly', q: 'Having found output where MR = MC, a monopolist sets price…', choices: ['On the MR curve', 'Equal to MC', 'On the demand curve above that output', 'Equal to average cost'], correct: 2, why: 'The price is the most buyers will pay for that quantity, read from demand.' },
    { worked: 'w-solow', topic: 'solow', q: 'In the Solow model, a permanent rise in the saving rate…', choices: ['Permanently raises the growth rate of output per worker', 'Raises the steady-state level of output per worker but not its long-run growth rate', 'Has no effect', 'Lowers steady-state capital'], correct: 1, why: 'Higher s raises k* and y* (a level effect); only technological progress sustains growth.' },
    { worked: 'w-externality', topic: 'externalities', q: 'With a negative production externality, the free market produces…', choices: ['Too little', 'The efficient amount', 'Too much', 'Nothing'], correct: 2, why: 'Firms ignore the external cost, so they produce where MPC = MSB, beyond the point where MSC = MSB.' },
    { worked: 'w-cournot', topic: 'cournot', q: 'Compared with monopoly and perfect competition, Cournot duopoly output is…', choices: ['Below monopoly output', 'Between monopoly and competitive output', 'Equal to competitive output', 'Above competitive output'], correct: 1, why: 'With linear demand and equal costs, Cournot total output is 2/3 of competitive output, monopoly is 1/2.' },
  ];

  window.QUIZ = {
    // Each item yields a fresh question; concept items are fixed.
    items: [
      // key: stable id used to store per-question results for spaced review.
      ...generators.map((g) => ({ key: 'calc:' + g.worked, kind: 'calc', worked: g.worked, topic: g.topic, make: () => g.gen() })),
      ...concepts.map((c, i) => ({ key: `concept:${c.worked}:${i}`, kind: 'concept', worked: c.worked, topic: c.topic, make: () => ({ q: c.q, parts: [{ label: 'Choose one', choices: c.choices, correct: c.correct }], solution: [c.why] }) })),
    ],
  };
})();
