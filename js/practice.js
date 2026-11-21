/* Worked answers, quiz generators and concept questions for the topics that had none:
   elastic vs inelastic demand, income elasticity, market demand, deriving demand and Engel
   curves, cost curves, the LAC envelope, the long-run industry, monopolistic competition, the
   Edgeworth box, injections and leakages, the Phillips curve, price indices and growth,
   loanable funds and the Lorenz curve. Loaded after quiz.js: it adds to window.WORKED and
   window.QUIZ.items, then puts the worked answers in course order. Where a topic's graph uses
   the same model, the worked numbers match its default sliders. */
(function () {
  const R = String.raw;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const int = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const n = (v, dp = 2) => String(+(+v).toFixed(dp));
  const sg = (v) => (v < 0 ? '−' + n(-v) : n(v)); // signed number with a proper minus

  const worked = [
    /* ───────────── Microeconomics ───────────── */
    {
      id: 'w-elastic-inelastic', topic: 'elastic-inelastic', kind: 'calc',
      title: 'Elastic and inelastic demand through the same point',
      question: 'Two straight-line demand curves pass through the same point A: P = 10, Q = 20. At A, demand for good E has |PED| = 3 and demand for good I has |PED| = 0.3. The price of both rises to 12. (a) Find the equation of each demand curve. (b) Find the new quantity of each. (c) Find the change in total revenue for each, split into revenue gained and revenue lost.',
      steps: [
        { t: 'A straight line through A with point elasticity |E| has slope dQ/dP = −|E| × Q/P = −|E| × 20/10 = −2|E|:', m: R`Q_E = 20 - 6(P - 10) = 80 - 6P, \qquad Q_I = 20 - 0.6(P - 10) = 26 - 0.6P` },
        { t: '(b) At P = 12:', m: R`Q_E = 80 - 72 = 8, \qquad Q_I = 26 - 7.2 = 18.8` },
        { t: '(c) Revenue at A is 10 × 20 = 200 for both goods. After the rise:', m: R`TR_E = 12 \times 8 = 96, \qquad TR_I = 12 \times 18.8 = 225.6` },
        { t: 'Split each change into the gain on units still sold (ΔP × Q₁) and the loss on units no longer sold (P₀ × ΔQ):', m: R`\begin{aligned} \Delta TR_E &= 2(8) - 10(12) = 16 - 120 = -104 \\ \Delta TR_I &= 2(18.8) - 10(1.2) = 37.6 - 12 = +25.6 \end{aligned}` },
        { t: 'Elastic demand: the lost-sales rectangle dominates, so revenue falls. Inelastic demand: the higher-price rectangle dominates, so revenue rises.' },
      ],
      answer: 'Q_E = 80 − 6P and Q_I = 26 − 0.6P. At P = 12, Q_E = 8 and Q_I = 18.8. Revenue from E falls by 104 (to 96); revenue from I rises by 25.6 (to 225.6). The graph’s default sliders show this case.',
      mistakes: ['Reading elasticity from the slope alone: it also depends on P/Q, which is why the two curves are compared at the same point.', 'Concluding that a price rise always raises revenue.', 'Forgetting that the revenue rule uses |PED| at the starting price: for a large change use the arc formula.'],
    },
    {
      id: 'w-income-elasticity', topic: 'income-elasticity', kind: 'calc',
      title: 'Classifying goods by income elasticity',
      question: 'A household’s weekly income rises from £50 to £75. Before the rise it buys 20 units of each of three goods; afterwards it buys 24 units of A, 16 units of B and 32 units of C. (a) Use the midpoint formula to find the income elasticity of each. (b) Classify each good. (c) Which way does each demand curve shift?',
      steps: [
        { t: 'Percentage change in income at the midpoint (M̄ = 62.5):', m: R`\frac{\Delta M}{\bar M} = \frac{25}{62.5} = 0.4` },
        { t: 'Good A (Q̄ = 22):', m: R`IED_A = \frac{4/22}{0.4} = \frac{0.182}{0.4} = 0.45` },
        { t: 'Good B (Q̄ = 18):', m: R`IED_B = \frac{-4/18}{0.4} = \frac{-0.222}{0.4} = -0.56` },
        { t: 'Good C (Q̄ = 26):', m: R`IED_C = \frac{12/26}{0.4} = \frac{0.462}{0.4} = 1.15` },
        { t: '(b) A: 0 < IED < 1, a normal necessity whose share of the budget falls as income rises. B: IED < 0, an inferior good. C: IED > 1, a normal luxury whose share of the budget rises.' },
        { t: '(c) At every price more of A and C is bought, so their demand curves shift right; B’s shifts left.' },
      ],
      answer: 'IED_A ≈ 0.45 (necessity), IED_B ≈ −0.56 (inferior), IED_C ≈ 1.15 (luxury). The demand curves for A and C shift right; B’s shifts left.',
      mistakes: ['Calling a necessity inferior: a necessity has a positive IED below 1.', 'Using end-point percentages, which give different answers for a rise and a fall in income.', 'Drawing an income change as a movement along the demand curve instead of a shift.'],
    },
    {
      id: 'w-market-demand', topic: 'market-demand', kind: 'calc',
      title: 'Market demand by horizontal summation',
      question: 'Two consumers have demand Q_A = 12 − P and Q_B = 12 − 2P. (a) Find market demand. (b) Where does the market demand curve kink? (c) Find quantity demanded at P = 4 and at P = 8. (d) Find the price elasticity of market demand at P = 4.',
      steps: [
        { t: 'Add quantities at each price, but only over the prices where each consumer buys. B’s choke price is 6 (12 − 2P = 0), A’s is 12.' },
        { t: '(a) Above P = 6 only A buys; below it both do:', m: R`Q = \begin{cases} 12 - P & 6 \le P \le 12 \\ 24 - 3P & 0 \le P < 6 \end{cases}` },
        { t: '(b) The kink is at B’s choke price: P = 6, Q = 6. Below it the curve is flatter because a second buyer joins.' },
        { t: '(c) At P = 4: Q_A = 8, Q_B = 4, so Q = 12 (check: 24 − 12 = 12). At P = 8 only A buys: Q = 4.' },
        { t: '(d) On the lower segment dQ/dP = −3:', m: R`PED = -3 \times \frac{4}{12} = -1` },
      ],
      answer: 'Q = 12 − P for P ≥ 6 and Q = 24 − 3P for P < 6, with a kink at (Q, P) = (6, 6). Q = 12 at P = 4 and 4 at P = 8. PED = −1 at P = 4. Set P = 4 on the graph to see the same split.',
      mistakes: ['Adding the inverse demands (P_A + P_B): that is vertical summation, used for public goods.', 'Writing Q = 24 − 3P for all prices, which gives B a negative quantity above P = 6.', 'Forgetting the kink when drawing market demand.'],
    },
    {
      id: 'w-demand-derivation', topic: 'demand-derivation', kind: 'calc',
      title: 'Deriving a demand curve from utility maximisation',
      question: 'A consumer has U = √(XY), income M = 40 and P_Y = 4. (a) Find the optimal X and Y when P_X = 2, 4 and 5. (b) Derive the demand curve for X. (c) Find its price elasticity. (d) Describe the price–consumption curve.',
      steps: [
        { t: 'Tangency: MRS = MU_X/MU_Y = Y/X must equal P_X/P_Y, so P_Y Y = P_X X. Spending is split equally between the goods.' },
        { t: 'With the budget P_X X + P_Y Y = 40, each good gets 20:', m: R`X^* = \frac{20}{P_X}, \qquad Y^* = \frac{20}{4} = 5` },
        { t: '(a) P_X = 2: X = 10. P_X = 4: X = 5. P_X = 5: X = 4. Y = 5 every time.' },
        { t: '(b) The demand curve plots the optimal X against its price:', m: R`X = \frac{20}{P_X} \quad\Longleftrightarrow\quad P_X = \frac{20}{X}` },
        { t: '(c) Spending on X is 20 whatever its price, so demand is unit elastic everywhere:', m: R`PED = \frac{dX}{dP_X}\cdot\frac{P_X}{X} = -\frac{20}{P_X^2}\cdot\frac{P_X}{20/P_X} = -1` },
        { t: '(d) Y stays at 5 as P_X changes, so the PCC is horizontal. A PCC sloping down (Y falls as P_X falls) would mean elastic demand; sloping up, inelastic.' },
      ],
      answer: 'X* = 20/P_X and Y* = 5: X = 10, 5 and 4 at P_X = 2, 4 and 5. The demand curve X = 20/P_X has PED = −1 at every price, and the PCC is horizontal at Y = 5. The graph’s default (P_X = 4) is the middle case.',
      mistakes: ['Holding utility constant instead of income: the ordinary demand curve keeps M fixed.', 'Plotting Y against P_X.', 'Assuming every demand curve has constant elasticity: that is special to Cobb–Douglas utility.'],
    },
    {
      id: 'w-engel-derivation', topic: 'engel-derivation', kind: 'calc',
      title: 'Deriving Engel curves for a normal and an inferior good',
      question: 'Prices are P_X = P_Y = 1. (a) With U = ln(X − 2) + ln Y, find the optimal X and Y at M = 10 and M = 14, and the equation of the Engel curve. (b) Find the income elasticity of X at M = 10. Is X a luxury, a necessity or inferior? (c) With U = 16 ln X + Y²/2 instead, the tangency condition is XY = 16. Find X at M = 10 and M = 17. What kind of good is X now?',
      steps: [
        { t: '(a) MRS = MU_X/MU_Y = Y/(X − 2). Setting it equal to P_X/P_Y = 1 gives the income–consumption curve Y = X − 2.' },
        { t: 'Substitute into the budget X + Y = M:', m: R`2X - 2 = M \;\Rightarrow\; X^* = 1 + \frac{M}{2}` },
        { t: 'M = 10: X = 6, Y = 4. M = 14: X = 8, Y = 6. Inverting X* gives the Engel curve:', m: R`M = 2X - 2` },
        { t: '(b)', m: R`IED = \frac{dX}{dM}\cdot\frac{M}{X} = \frac{1}{2}\times\frac{10}{6} = 0.83` },
        { t: 'Between 0 and 1: X is a normal good and a necessity. The first 2 units are a subsistence amount, so X rises less than in proportion to income.' },
        { t: '(c) With Y = M − X, the tangency condition becomes X(M − X) = 16. The smaller root is the optimum:', m: R`X^* = \frac{M - \sqrt{M^2 - 64}}{2}: \quad M = 10 \Rightarrow X = \frac{10 - 6}{2} = 2, \qquad M = 17 \Rightarrow X = \frac{17 - 15}{2} = 1` },
        { t: 'X falls from 2 to 1 as income rises, so X is inferior. Its Engel curve, M = X + 16/X, slopes the other way: higher incomes go with less X.' },
      ],
      answer: 'Normal case: X* = 1 + M/2 (6 at M = 10, 8 at M = 14), Engel curve M = 2X − 2, IED = 0.83 at M = 10, so X is a necessity. Inferior case: X falls from 2 to 1 as M rises from 10 to 17, so X is inferior.',
      mistakes: ['Confusing the Engel curve (Q against income) with the demand curve (Q against price).', 'Calling a good inferior because its IED is below 1: a necessity still has positive IED.', 'Taking the larger root of X(M − X) = 16, which is a utility minimum along the budget line.'],
    },
    {
      id: 'w-cost-curves', topic: 'cost-curves', kind: 'calc',
      title: 'Total, average and marginal cost from a cubic cost function',
      question: 'A firm has fixed cost F = 8 and variable cost VC = 6Q − 1.5Q² + 0.15Q³. (a) At Q = 6 find TC, AFC, AVC, ATC and MC. (b) Find the output where AVC is lowest and the minimum AVC. (c) Find the output where MC is lowest. What is happening to TC there? (d) Is ATC rising or falling at Q = 6?',
      steps: [
        { t: 'Per-unit and marginal cost functions:', m: R`AVC = 6 - 1.5Q + 0.15Q^2, \qquad MC = \frac{dTC}{dQ} = 6 - 3Q + 0.45Q^2` },
        { t: '(a) At Q = 6: VC = 36 − 54 + 32.4 = 14.4, so TC = 22.4.', m: R`AFC = \tfrac{8}{6} = 1.33,\quad AVC = 2.4,\quad ATC = 3.73,\quad MC = 6 - 18 + 16.2 = 4.2` },
        { t: '(b) Minimise AVC:', m: R`\frac{dAVC}{dQ} = -1.5 + 0.3Q = 0 \;\Rightarrow\; Q = 5, \quad AVC = 6 - 7.5 + 3.75 = 2.25` },
        { t: 'Check: MC(5) = 6 − 15 + 11.25 = 2.25 = AVC. MC cuts AVC at its minimum. This is the shutdown price.' },
        { t: '(c) Minimise MC:', m: R`\frac{dMC}{dQ} = -3 + 0.9Q = 0 \;\Rightarrow\; Q = 3.33, \quad MC = 6 - 10 + 5 = 1` },
        { t: 'This is TC’s inflection point: before it TC is concave (increasing marginal returns), after it convex (diminishing marginal returns).' },
        { t: '(d) MC(6) = 4.2 is above ATC(6) = 3.73, so ATC is rising: its minimum is at an output below 6.' },
      ],
      answer: 'At Q = 6: TC = 22.4, AFC = 1.33, AVC = 2.4, ATC = 3.73, MC = 4.2. Minimum AVC is 2.25 at Q = 5 (the shutdown price). MC is lowest (1) at Q = 3.33, TC’s inflection point. ATC is rising at Q = 6. The graph’s default sliders show this firm.',
      mistakes: ['Including the fixed cost in MC: fixed cost does not change with output.', 'Placing the minimum of ATC and AVC at the same output: ATC’s minimum is to the right.', 'Differentiating ATC instead of TC to get MC.'],
    },
    {
      id: 'w-lac-envelope', topic: 'lac-envelope', kind: 'calc',
      title: 'LAC, LMC and economies of scale',
      question: 'A firm’s long-run average cost is LAC = 3 + 0.08(Q − 6)². (a) Find long-run total cost and long-run marginal cost. (b) Find minimum efficient scale and minimum LAC. (c) Find LAC and LMC at Q = 3 and Q = 8 and say whether there are economies or diseconomies of scale at each. (d) A plant built for Q = 6 is used to produce Q = 3. How does its short-run average cost compare with LAC(3)?',
      steps: [
        { t: '(a)', m: R`LTC = Q\cdot LAC = 3Q + 0.08Q(Q - 6)^2, \qquad LMC = LAC + Q\frac{dLAC}{dQ} = 3 + 0.08(Q - 6)^2 + 0.16Q(Q - 6)` },
        { t: '(b) dLAC/dQ = 0.16(Q − 6) = 0 at Q = 6, so minimum efficient scale is Q = 6 with LAC = 3. There LMC = LAC = 3.' },
        { t: '(c) At Q = 3:', m: R`LAC = 3 + 0.72 = 3.72, \qquad LMC = 3.72 + 0.16(3)(-3) = 2.28` },
        { t: 'LMC < LAC, so LAC is falling: economies of scale.' },
        { t: 'At Q = 8:', m: R`LAC = 3 + 0.32 = 3.32, \qquad LMC = 3.32 + 0.16(8)(2) = 5.88` },
        { t: 'LMC > LAC, so LAC is rising: diseconomies of scale.' },
        { t: '(d) The Q = 6 plant’s SAC touches LAC only at Q = 6, so at Q = 3 it costs more than 3.72 per unit. The cheapest way to make 3 units is a smaller plant whose SAC is tangent to LAC at Q = 3, to the left of that plant’s own minimum.' },
      ],
      answer: 'LMC = 3 + 0.08(Q − 6)² + 0.16Q(Q − 6). MES is Q = 6, where LAC = LMC = 3. At Q = 3, LAC = 3.72 and LMC = 2.28 (economies of scale); at Q = 8, LAC = 3.32 and LMC = 5.88 (diseconomies). The big plant costs more than 3.72 per unit at Q = 3. This is the graph’s U-shaped case.',
      mistakes: ['Saying every SAC touches LAC at its own minimum: only the plant at minimum efficient scale does (unless LAC is flat).', 'Confusing diminishing returns (short run, one fixed input) with diseconomies of scale (long run, all inputs vary).'],
    },
    {
      id: 'w-lr-industry', topic: 'lr-industry', kind: 'calc',
      title: 'Short- and long-run adjustment in a competitive industry',
      question: 'Each firm in a perfectly competitive industry has ATC = q + 4/q and MC = 2q. Market demand is P = 10 − 0.25Q, and firms enter or leave freely at constant input prices. (a) Find the long-run equilibrium price, output per firm, market output and number of firms. (b) Demand rises to P = 12 − 0.25Q. Before any entry, find the short-run price, output per firm and profit per firm. (c) Find the new long-run equilibrium.',
      steps: [
        { t: '(a) In the long run P = minimum ATC:', m: R`\frac{dATC}{dq} = 1 - \frac{4}{q^2} = 0 \;\Rightarrow\; q = 2,\quad ATC = 2 + 2 = 4 = MC` },
        { t: 'So P = 4. Market output: 4 = 10 − 0.25Q, so Q = 24 and there are 24/2 = 12 firms.' },
        { t: '(b) In the short run the 12 firms each supply along MC (P = 2q, so q = P/2). Industry supply is Q = 12 × P/2 = 6P:', m: R`P = 12 - 0.25(6P) \;\Rightarrow\; 2.5P = 12 \;\Rightarrow\; P = 4.8,\quad Q = 28.8,\quad q = 2.4` },
        { t: 'Profit per firm:', m: R`ATC(2.4) = 2.4 + \frac{4}{2.4} = 4.067, \qquad \pi = (4.8 - 4.067)\times 2.4 = 1.76` },
        { t: '(c) Supernormal profit attracts entry until P is back at 4 = min ATC:', m: R`Q = \frac{12 - 4}{0.25} = 32, \qquad n = \frac{32}{2} = 16` },
        { t: 'With constant input prices the long-run supply curve is horizontal at P = 4: demand changes the number of firms, not the price.' },
      ],
      answer: 'Long run: P = 4, q = 2, Q = 24, 12 firms. After demand rises: P = 4.8, q = 2.4, profit 1.76 per firm. New long run: P = 4, Q = 32, 16 firms. On the graph, the constant-cost case with a = 12 shows this adjustment.',
      mistakes: ['Letting price stay high in the long run in a constant-cost industry.', 'Forgetting that in the short run the number of firms is fixed, so industry supply is n times one firm’s MC.', 'Counting normal profit as profit: zero economic profit still covers the opportunity cost of capital.'],
    },
    {
      id: 'w-monopolistic-competition', topic: 'monopolistic-competition', kind: 'calc',
      title: 'Monopolistic competition in the short and long run',
      question: 'A firm in monopolistic competition faces demand P = 7 − 0.5Q, so MR = 7 − Q. MC = 2 and AC = 2 + 4/Q (a fixed cost of 4). (a) Find the profit-maximising output, price and profit. (b) What happens in the long run? (c) In long-run equilibrium demand has shifted to P = a − 0.5Q and is tangent to AC. Find output, price and a. (d) Show that the firm has excess capacity and charges a markup over MC.',
      steps: [
        { t: '(a) MR = MC:', m: R`7 - Q = 2 \;\Rightarrow\; Q = 5,\quad P = 7 - 2.5 = 4.5,\quad AC = 2 + 0.8 = 2.8` },
        { t: 'Profit:', m: R`\pi = (4.5 - 2.8) \times 5 = 8.5` },
        { t: '(b) Supernormal profit attracts new brands. Each firm loses customers, so its demand curve shifts left (a falls) until profit is zero.' },
        { t: '(c) Tangency: P = AC and the slopes are equal:', m: R`-0.5 = \frac{dAC}{dQ} = -\frac{4}{Q^2} \;\Rightarrow\; Q = \sqrt{8} = 2.83,\quad P = 2 + \frac{4}{2.83} = 3.41` },
        { t: 'Then a = P + 0.5Q = 3.41 + 1.41 = 4.83. Check: MR = a − Q = 4.83 − 2.83 = 2 = MC.' },
        { t: '(d) AC is still falling at Q = 2.83 (here it falls at every output), so the firm produces less than the output that would minimise average cost: excess capacity. P = 3.41 > MC = 2, a markup of 1.41, so output is below the allocatively efficient level.' },
      ],
      answer: 'Short run: Q = 5, P = 4.5, profit 8.5. Entry shifts demand in until it is tangent to AC: Q = 2√2 ≈ 2.83, P ≈ 3.41, a ≈ 4.83, zero profit, with P > MC and AC still falling (excess capacity). Graph default a = 7 is the short-run case.',
      mistakes: ['Setting P = MC in the long run: that is perfect competition.', 'Drawing the long-run tangency at the minimum of AC.', 'Forgetting that the firm still sets MR = MC in the long run.'],
    },
    {
      id: 'w-edgeworth', topic: 'edgeworth', kind: 'calc',
      title: 'Edgeworth box: contract curve and competitive equilibrium',
      question: 'Two consumers share 10 units of X and 10 of Y. Both have U = √(XY). A starts with (X, Y) = (8, 2) and B with (2, 8). (a) Find each person’s MRS at the endowment. Is the endowment Pareto efficient? (b) Find the contract curve. (c) Find the competitive equilibrium price ratio P_X/P_Y and the final allocation. (d) Show that both are better off.',
      steps: [
        { t: '(a) MRS = MU_X/MU_Y = Y/X. A: 2/8 = 0.25. B: 8/2 = 4. They differ, so the endowment is not Pareto efficient: A values a unit of X at 0.25 Y and B at 4 Y, so both gain if A trades X to B at any rate in between.' },
        { t: '(b) Efficiency needs equal MRSs:', m: R`\frac{Y_A}{X_A} = \frac{10 - Y_A}{10 - X_A} \;\Rightarrow\; Y_A = X_A` },
        { t: 'The contract curve is the diagonal of the box.' },
        { t: '(c) With √(XY) each person spends half of their wealth on each good. Set P_Y = 1 and P_X = p. A’s wealth is 8p + 2 and B’s is 2p + 8:', m: R`X_A + X_B = \frac{8p + 2}{2p} + \frac{2p + 8}{2p} = \frac{10p + 10}{2p} = 10 \;\Rightarrow\; p = 1` },
        { t: 'Each has wealth 10, so each buys (5, 5). This lies on the contract curve.' },
        { t: '(d) U_A rises from √16 = 4 to √25 = 5, and U_B does the same. The competitive equilibrium is Pareto efficient (the first welfare theorem).' },
      ],
      answer: 'MRS_A = 0.25 and MRS_B = 4, so the endowment is inefficient. The contract curve is Y_A = X_A. At P_X/P_Y = 1 each ends with (5, 5), and both utilities rise from 4 to 5. The graph’s default endowment is (8, 2).',
      mistakes: ['Thinking Pareto efficiency means equal bundles: any point on the contract curve is efficient.', 'Measuring B’s bundle from the bottom-left corner.', 'Solving for both prices: only the ratio is determined.'],
    },

    /* ───────────── Macroeconomics ───────────── */
    {
      id: 'w-injections-leakages', topic: 'injections-leakages', kind: 'calc',
      title: 'Equilibrium income from injections and leakages',
      question: 'In an open economy with government, C = 50 + 0.8Y_d, net taxes NT = 0.2Y, imports Z = 0.14Y, and injections I + G + X = 200 (all £bn). (a) Find equilibrium income using injections = leakages. (b) Find saving, net taxes and imports at equilibrium and check that leakages equal injections. (c) Find the multiplier and the effect of a £50bn rise in G.',
      steps: [
        { t: 'Disposable income is Y_d = Y − 0.2Y = 0.8Y. Saving is what households do not spend:', m: R`S = Y_d - C = -50 + 0.2Y_d = -50 + 0.16Y` },
        { t: 'Leakages:', m: R`W = S + NT + Z = -50 + 0.16Y + 0.2Y + 0.14Y = -50 + 0.5Y` },
        { t: 'The marginal propensity to withdraw is 0.5 = 1 − c(1 − t) + z = 1 − 0.64 + 0.14.' },
        { t: '(a) Injections = leakages:', m: R`200 = -50 + 0.5Y \;\Rightarrow\; Y^* = 500` },
        { t: '(b) NT = 100, Z = 70, Y_d = 400, C = 50 + 320 = 370, S = 400 − 370 = 30.', m: R`S + NT + Z = 30 + 100 + 70 = 200 = I + G + X` },
        { t: '(c)', m: R`k = \frac{1}{MPW} = \frac{1}{0.5} = 2, \qquad \Delta Y = 2 \times 50 = 100` },
        { t: 'Y rises to 600, and leakages rise by 0.5 × 100 = 50, matching the extra injection.' },
      ],
      answer: 'Y* = 500; S = 30, NT = 100, Z = 70, which add to 200 = injections. The multiplier is 2, so a £50bn rise in G raises Y to 600. On the graph (units of £100bn) this is the default: J = 2, c = 0.8, t = 0.2, z = 0.14.',
      mistakes: ['Setting S = I in an economy with government and trade.', 'Applying the MPC to Y instead of disposable income.', 'Leaving the marginal propensity to import out of the multiplier.'],
    },
    {
      id: 'w-phillips', topic: 'phillips', kind: 'calc',
      title: 'Accelerating inflation and disinflation on the Phillips curve',
      question: 'The short-run Phillips curve is π = πᵉ − (u − 5) + v, with u* = 5%. Expected inflation is 2% and there are no supply shocks. (a) The government holds unemployment at 4%. Find inflation. (b) Expectations are adaptive (πᵉ = last year’s π). If u stays at 4%, find inflation in each of the next two years. (c) Once expected inflation is 4%, what unemployment brings inflation back to 2% in one year? (d) An oil shock adds v = 2 with u = 5% and πᵉ = 2%. Find inflation.',
      steps: [
        { t: '(a)', m: R`\pi = 2 - (4 - 5) = 3\%` },
        { t: '(b) Next year πᵉ = 3:', m: R`\pi = 3 + 1 = 4\%, \quad\text{then}\quad \pi = 4 + 1 = 5\%` },
        { t: 'Holding u below u* makes inflation rise by 1 point every year: the SRPC shifts up each time expectations catch up.' },
        { t: '(c)', m: R`2 = 4 - (u - 5) \;\Rightarrow\; u = 7\%` },
        { t: 'Disinflation costs a year of unemployment 2 points above the natural rate.' },
        { t: '(d)', m: R`\pi = 2 - 0 + 2 = 4\%` },
        { t: 'A supply shock shifts the SRPC up: higher inflation at the same unemployment (stagflation). Only at u = u* is π = πᵉ, so the long-run Phillips curve is vertical at 5%.' },
      ],
      answer: '(a) 3%. (b) 4%, then 5%: inflation accelerates. (c) u = 7%. (d) 4%. The graph’s defaults (u = 4, πᵉ = 2, b = 1) show part (a); press “Expectations catch up” for part (b).',
      mistakes: ['Treating the short-run trade-off as permanent.', 'Getting the sign wrong: unemployment below u* raises inflation.', 'Moving along the SRPC for a supply shock instead of shifting it.'],
    },

    {
      id: 'w-real-gdp', topic: 'growth-measure', kind: 'calc',
      title: 'Real GDP, the deflator and growth per person from a price–quantity table',
      question: 'An island produces only coconuts and pineapples. In 2010 it sold 240 coconuts at $4 and 100 pineapples at $6. In 2020 it sold 300 coconuts at $5 and 120 pineapples at $9. Use 2010 as the base year. (a) Find nominal GDP in both years and real GDP in 2020. (b) Find real GDP growth and the GDP deflator for 2020. (c) The population grew from 10 to 12 (thousand). What happened to real GDP per person?',
      steps: [
        { t: '(a) Nominal GDP values each year’s output at that year’s prices:', m: R`2010: 240(4) + 100(6) = 1{,}560, \qquad 2020: 300(5) + 120(9) = 2{,}580` },
        { t: 'Real GDP in 2020 values 2020 quantities at 2010 prices (in the base year, real = nominal):', m: R`300(4) + 120(6) = 1{,}920` },
        { t: '(b)', m: R`g = \frac{1{,}920}{1{,}560} - 1 = 23.1\%, \qquad \text{deflator} = \frac{2{,}580}{1{,}920} \times 100 = 134.4` },
        { t: 'Prices rose 34.4% over the decade. Nominal GDP grew 65.4%, but only 23.1% of that is more output.' },
        { t: '(c)', m: R`\frac{1{,}560}{10} = 156, \qquad \frac{1{,}920}{12} = 160, \qquad \frac{160}{156} - 1 = 2.6\%` },
        { t: 'Most of the real growth went to a larger population: output per person rose only 2.6%.' },
      ],
      answer: 'Nominal GDP: $1,560 (2010) and $2,580 (2020). Real GDP in 2020 at 2010 prices: $1,920, so real growth is 23.1% and the 2020 deflator is 134.4. Real GDP per person rose from 156 to 160, only 2.6%.',
      mistakes: ['Valuing base-year quantities at current prices (that is a price index, not real GDP).', 'Reporting nominal GDP growth as growth in output.', 'Writing growth as 1 − new/old instead of new/old − 1.', 'Comparing living standards without dividing by population.'],
    },
    /* ───────────── Further topics ───────────── */
    {
      id: 'w-growth-measure', topic: 'growth-measure', kind: 'calc',
      title: 'CPI, real growth and the rule of 70',
      question: 'A basket holds 10 loaves and 5 cinema tickets. Prices were £2 and £8 in the base year and £2.20 and £9 a year later. Over the same year nominal GDP rose from £500bn to £540bn and the GDP deflator from 100 to 104. (a) Find the CPI for the second year and CPI inflation. (b) Find real GDP growth. (c) How long would real GDP take to double at that rate? (d) Wages rose 5%. What happened to the real wage?',
      steps: [
        { t: '(a) Cost of the fixed basket:', m: R`\text{base: } 10(2) + 5(8) = 60, \qquad \text{next year: } 10(2.2) + 5(9) = 67` },
        { t: 'CPI = 67/60 × 100 = 111.7, so CPI inflation is 11.7%.' },
        { t: '(b) Real GDP in base-year prices:', m: R`\frac{540}{1.04} = 519.2, \qquad g = \frac{519.2}{500} - 1 = 3.85\%` },
        { t: 'Approximation: nominal growth 8% minus inflation 4% is about 4%.' },
        { t: '(c) Rule of 70:', m: R`\frac{70}{3.85} \approx 18.2 \text{ years} \quad (\text{exact: } \ln 2/\ln 1.0385 = 18.4)` },
        { t: '(d)', m: R`\frac{1.05}{1.117} - 1 = -6.0\%` },
        { t: 'The nominal rise is smaller than inflation, so the real wage falls by about 6%.' },
      ],
      answer: 'CPI = 111.7 (11.7% inflation); real GDP growth = 3.85%; doubling time about 18 years; the real wage falls by about 6%.',
      mistakes: ['Using nominal GDP growth as a measure of growth in output.', 'Dividing 70 by a decimal growth rate (0.0385) instead of a percentage.', 'Mixing up the CPI (a fixed consumer basket) with the GDP deflator (all domestic output).'],
    },
    {
      id: 'w-loanable-funds', topic: 'loanable-funds', kind: 'calc',
      title: 'Crowding out in the loanable funds market',
      question: 'In a closed economy private saving is S = 1.25(r − 1) and private investment is I = 1.25(9 − r), in £bn with r in %. (a) With a balanced budget, find the equilibrium interest rate, saving and investment. (b) The government borrows B = 2 to fund a deficit. Find the new interest rate, private saving and private investment. (c) How much investment is crowded out, and why less than 2?',
      steps: [
        { t: '(a)', m: R`1.25(r - 1) = 1.25(9 - r) \;\Rightarrow\; r = 5\%,\quad S = I = 5` },
        { t: '(b) Demand for funds becomes I + B:', m: R`1.25(r - 1) = 1.25(9 - r) + 2 \;\Rightarrow\; 2.5r = 14.5 \;\Rightarrow\; r = 5.8\%` },
        { t: 'Then:', m: R`S = 1.25(4.8) = 6, \qquad I = 1.25(3.2) = 4, \qquad S = I + B` },
        { t: '(c) Investment falls from 5 to 4: half of the borrowing crowds out private investment. The other half is met by extra saving drawn out by the higher interest rate.' },
        { t: 'Crowding out would be complete only if saving did not respond to r (a vertical supply of funds). National saving S − B = 4 equals investment.' },
      ],
      answer: 'r = 5% with S = I = 5. With B = 2: r = 5.8%, S = 6, I = 4. Investment falls by 1, so half the deficit crowds out private investment. Set B = 2 on the graph to see it.',
      mistakes: ['Assuming investment falls by the full amount of borrowing.', 'Shifting the supply curve instead of demand when the government borrows.', 'Forgetting that private saving rises as r rises.'],
    },
    {
      id: 'w-lorenz', topic: 'lorenz', kind: 'calc',
      title: 'Lorenz curve and Gini coefficient from quintile shares',
      question: 'Income shares by quintile, poorest first, are 5%, 10%, 15%, 25% and 45%. (a) Find the cumulative shares that give the Lorenz curve. (b) Estimate the Gini coefficient using trapezia. (c) Find the S80/S20 ratio. (d) If the Lorenz curve were L(x) = x^k, what k gives about the same Gini?',
      steps: [
        { t: '(a) Cumulative income share at 20%, 40%, 60%, 80% and 100% of people: 5%, 15%, 30%, 55%, 100%.' },
        { t: '(b) Area under the Lorenz curve, one trapezium per quintile (width 0.2):', m: R`B = 0.1\,(0.05 + 0.20 + 0.45 + 0.85 + 1.55) = 0.31` },
        { t: 'The area under the line of equality is 0.5:', m: R`G = \frac{0.5 - B}{0.5} = 1 - 2B = 1 - 0.62 = 0.38` },
        { t: '(c) S80/S20 = 45/5 = 9: the richest fifth receive nine times the income of the poorest fifth.' },
        { t: '(d)', m: R`\frac{k - 1}{k + 1} = 0.38 \;\Rightarrow\; k = \frac{1.38}{0.62} \approx 2.2` },
        { t: 'The graph’s default k = 2.2 gives G = 0.375.' },
      ],
      answer: 'Lorenz points: (20%, 5%), (40%, 15%), (60%, 30%), (80%, 55%). Area B = 0.31, Gini ≈ 0.38, S80/S20 = 9, and k ≈ 2.2.',
      mistakes: ['Plotting each quintile’s own share instead of the cumulative share.', 'Using the area under the Lorenz curve as the Gini.', 'Thinking the Gini can rank two distributions whose Lorenz curves cross without any judgement.'],
    },
  ];

  const generators = [
    {
      worked: 'w-elastic-inelastic', topic: 'elastic-inelastic',
      gen() {
        const P0 = pick([8, 10, 20]), Q0 = pick([20, 40, 50]), Ee = pick([2, 2.5, 3, 4]), Ei = pick([0.2, 0.4, 0.5, 0.8]);
        const dP = pick([-2, -1, 1, 2]) * (P0 === 20 ? 2 : 1), P1 = P0 + dP;
        const be = (Ee * Q0) / P0, bi = (Ei * Q0) / P0, Qe = Q0 - be * dP, Qi = Q0 - bi * dP;
        if (Qe <= 0) return this.gen();
        const dTe = P1 * Qe - P0 * Q0, dTi = P1 * Qi - P0 * Q0;
        return {
          q: `Two straight-line demand curves pass through P = ${P0}, Q = ${Q0}. There |PED| is ${Ee} for good E and ${Ei} for good I. The price ${dP > 0 ? 'rises' : 'falls'} to ${P1}.`,
          parts: [
            { label: 'New quantity of the elastic good E', answer: Qe },
            { label: 'Change in total revenue from E', answer: dTe },
            { label: 'Change in total revenue from I', answer: dTi },
          ],
          solution: [
            `Slope through the point: dQ/dP = −|E| × Q/P, so ${sg(-be)} for E and ${sg(-bi)} for I.`,
            `New quantities: Q_E = ${Q0} − ${n(be)}(${sg(dP)}) = ${n(Qe)}, Q_I = ${Q0} − ${n(bi)}(${sg(dP)}) = ${n(Qi)}.`,
            `TR starts at ${P0 * Q0}. ΔTR_E = ${P1} × ${n(Qe)} − ${P0 * Q0} = ${sg(dTe)}; ΔTR_I = ${P1} × ${n(Qi)} − ${P0 * Q0} = ${sg(dTi)}.`,
            `Elastic demand: price and revenue move in opposite directions. Inelastic: the same direction.`,
          ],
        };
      },
    },
    {
      worked: 'w-income-elasticity', topic: 'income-elasticity',
      gen() {
        const M0 = pick([40, 50, 60, 100]), M1 = M0 * pick([1.2, 1.25, 1.5, 0.8]), Q0 = pick([10, 20, 40]);
        const Q1 = Q0 + pick([-4, -2, 2, 4, 8, 12]) * (Q0 / 20);
        if (Q1 <= 0) return this.gen();
        const ied = ((Q1 - Q0) / ((Q0 + Q1) / 2)) / ((M1 - M0) / ((M0 + M1) / 2));
        if (Math.abs(ied - 1) < 0.05) return this.gen();
        const cls = ied < 0 ? 2 : ied < 1 ? 1 : 0;
        return {
          q: `Income ${M1 > M0 ? 'rises' : 'falls'} from £${M0} to £${n(M1)} and the quantity bought of a good changes from ${Q0} to ${n(Q1)}.`,
          parts: [
            { label: 'Income elasticity (midpoint formula)', answer: ied },
            { label: 'The good is…', choices: ['Normal: a luxury', 'Normal: a necessity', 'Inferior'], correct: cls },
          ],
          solution: [
            `%ΔQ = ${sg(Q1 - Q0)}/${n((Q0 + Q1) / 2)} = ${sg((Q1 - Q0) / ((Q0 + Q1) / 2))}; %ΔM = ${sg(M1 - M0)}/${n((M0 + M1) / 2)} = ${sg((M1 - M0) / ((M0 + M1) / 2))}.`,
            `IED = ${sg(ied)}: ${['above 1, a luxury', 'between 0 and 1, a necessity', 'negative, an inferior good'][cls]}.`,
          ],
        };
      },
    },
    {
      worked: 'w-market-demand', topic: 'market-demand',
      gen() {
        const b1 = pick([1, 2]), a1 = b1 * pick([10, 12, 15, 20]), cA = a1 / b1;
        const b2 = pick([1, 2, 3]), cB = int(3, cA - 3), a2 = b2 * cB;
        const pl = int(1, cB - 1), ph = int(cB + 1, cA - 1);
        const ql = a1 + a2 - (b1 + b2) * pl, qh = a1 - b1 * ph;
        return {
          q: `Two consumers have demand Q_A = ${a1} − ${b1 === 1 ? '' : b1}P and Q_B = ${a2} − ${b2 === 1 ? '' : b2}P.`,
          parts: [
            { label: `Market quantity demanded at P = ${pl}`, answer: ql },
            { label: `Market quantity demanded at P = ${ph}`, answer: qh },
            { label: 'Price at which market demand kinks', answer: cB },
          ],
          solution: [
            `B buys only below its choke price ${a2}/${b2} = ${cB}; A buys below ${cA}.`,
            `At P = ${pl} both buy: Q = (${a1} − ${b1 * pl}) + (${a2} − ${b2 * pl}) = ${ql}.`,
            `At P = ${ph} only A buys: Q = ${a1} − ${b1 * ph} = ${qh}.`,
            `The kink is where B starts buying, at P = ${cB}.`,
          ],
        };
      },
    },
    {
      worked: 'w-demand-derivation', topic: 'demand-derivation',
      gen() {
        const M = pick([40, 60, 80, 120]), PY = pick([2, 4, 5]), PX = pick([1, 2, 4, 5, 8]);
        return {
          q: `A consumer has U = √(XY), income M = ${M}, P_X = ${PX} and P_Y = ${PY}.`,
          parts: [
            { label: 'Optimal X', answer: M / (2 * PX) },
            { label: 'Optimal Y', answer: M / (2 * PY) },
            { label: 'Price elasticity of demand for X', answer: -1 },
          ],
          solution: [
            `MRS = Y/X = P_X/P_Y, so P_X X = P_Y Y: half of income goes on each good.`,
            `X* = ${M}/(2 × ${PX}) = ${n(M / (2 * PX))}; Y* = ${M}/(2 × ${PY}) = ${n(M / (2 * PY))}.`,
            `Demand is X = ${M / 2}/P_X: spending on X is fixed, so PED = −1 at every price.`,
          ],
        };
      },
    },
    {
      worked: 'w-engel-derivation', topic: 'engel-derivation',
      gen() {
        const s = pick([1, 2, 3, 4]), M = 2 * int(s + 2, 20), X = (M + s) / 2, ied = (0.5 * M) / X;
        return {
          q: `Prices are P_X = P_Y = 1 and U = ln(X − ${s}) + ln Y. Income is M = ${M}.`,
          parts: [
            { label: 'Optimal X', answer: X },
            { label: 'Income elasticity of X at this income', answer: ied },
            { label: 'X is…', choices: ['A luxury', 'A necessity', 'Inferior'], correct: 1 },
          ],
          solution: [
            `MRS = Y/(X − ${s}) = 1, so Y = X − ${s}. With X + Y = ${M}: 2X − ${s} = ${M}, X* = ${n(X)}.`,
            `The Engel curve is X = (M + ${s})/2, so dX/dM = 0.5 and IED = 0.5 × ${M}/${n(X)} = ${n(ied)}.`,
            `0 < IED < 1: a necessity.`,
          ],
        };
      },
    },
    {
      worked: 'w-cost-curves', topic: 'cost-curves',
      gen() {
        const Qm = pick([4, 5, 6, 8]), c = pick([0.1, 0.2, 0.25]), b = 2 * c * Qm, extra = pick([1, 2, 3]), a = c * Qm * Qm + extra;
        const F = pick([5, 8, 10, 20]), Q = int(2, 10);
        const avc = a - b * Q + c * Q * Q, mc = a - 2 * b * Q + 3 * c * Q * Q;
        return {
          q: `A firm has fixed cost ${F} and variable cost VC = ${n(a)}Q − ${n(b)}Q² + ${n(c)}Q³.`,
          parts: [
            { label: `AVC at Q = ${Q}`, answer: avc },
            { label: `MC at Q = ${Q}`, answer: mc },
            { label: 'Minimum AVC (the shutdown price)', answer: extra },
          ],
          solution: [
            `AVC = ${n(a)} − ${n(b)}Q + ${n(c)}Q²; at Q = ${Q}, AVC = ${n(avc)}.`,
            `MC = ${n(a)} − ${n(2 * b)}Q + ${n(3 * c)}Q²; at Q = ${Q}, MC = ${n(mc)}.`,
            `dAVC/dQ = −${n(b)} + ${n(2 * c)}Q = 0 at Q = ${Qm}, where AVC = ${n(extra)} (and MC = AVC).`,
          ],
        };
      },
    },
    {
      worked: 'w-lac-envelope', topic: 'lac-envelope',
      gen() {
        const A0 = pick([2, 3, 4, 5]), k = pick([0.05, 0.08, 0.1, 0.2]), m = pick([4, 5, 6, 8, 10]);
        let Q = int(1, 2 * m); if (Q === m) Q += 1;
        const lac = A0 + k * (Q - m) ** 2, lmc = lac + 2 * k * Q * (Q - m);
        return {
          q: `A firm’s long-run average cost is LAC = ${A0} + ${k}(Q − ${m})².`,
          parts: [
            { label: 'Minimum efficient scale (Q)', answer: m },
            { label: `LMC at Q = ${Q}`, answer: lmc },
            { label: `At Q = ${Q} the firm has…`, choices: ['Economies of scale', 'Diseconomies of scale'], correct: Q < m ? 0 : 1 },
          ],
          solution: [
            `dLAC/dQ = ${n(2 * k)}(Q − ${m}) = 0 at Q = ${m}, the minimum efficient scale (LAC = ${A0}).`,
            `LMC = LAC + Q·dLAC/dQ = ${n(lac)} + ${Q} × ${sg(2 * k * (Q - m))} = ${n(lmc)}.`,
            `LMC ${lmc < lac ? 'below' : 'above'} LAC: LAC is ${lmc < lac ? 'falling (economies' : 'rising (diseconomies'} of scale).`,
          ],
        };
      },
    },
    {
      worked: 'w-lr-industry', topic: 'lr-industry',
      gen() {
        const k = pick([1, 4, 9, 16]), q = Math.sqrt(k), P = 2 * q, b = pick([0.1, 0.25, 0.5]), Q = pick([24, 48, 60, 120]);
        const a = P + b * Q, nF = Q / q, a2 = a + pick([1, 2, 3]), Psr = a2 / (1 + (b * nF) / 2);
        return {
          q: `Each competitive firm has ATC = q + ${k}/q and MC = 2q. Market demand is P = ${n(a)} − ${b}Q, and firms enter and leave freely at constant input prices.`,
          parts: [
            { label: 'Long-run price', answer: P },
            { label: 'Number of firms in the long run', answer: nF },
            { label: `Demand rises to P = ${n(a2)} − ${b}Q. Short-run price before entry`, answer: Psr },
          ],
          solution: [
            `Min ATC: 1 − ${k}/q² = 0 at q = ${q}, ATC = ${P}. In the long run P = ${P}.`,
            `Q = (${n(a)} − ${P})/${b} = ${Q}, so ${Q}/${q} = ${nF} firms.`,
            `Short run: ${nF} firms each supply q = P/2, so industry supply is ${n(nF / 2)}P. P = ${n(a2)} − ${b}(${n(nF / 2)}P) gives P = ${n(Psr)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-monopolistic-competition', topic: 'monopolistic-competition',
      gen() {
        const b = pick([0.5, 1, 2]), QL = pick([2, 3, 4, 5]), F = b * QL * QL, c = pick([2, 3, 5]);
        const a = c + 2 * b * (QL + int(1, 4)), Q = (a - c) / (2 * b), P = (a + c) / 2, prof = (P - c) * Q - F;
        return {
          q: `A firm in monopolistic competition faces demand P = ${n(a)} − ${b}Q. MC = ${c} and AC = ${c} + ${n(F)}/Q.`,
          parts: [
            { label: 'Short-run profit-maximising output', answer: Q },
            { label: 'Short-run profit', answer: prof },
            { label: 'Long-run output once entry makes demand tangent to AC', answer: QL },
          ],
          solution: [
            `MR = ${n(a)} − ${n(2 * b)}Q = ${c} gives Q = ${n(Q)} and P = ${n(P)}.`,
            `Profit = (P − MC)Q − F = (${n(P)} − ${c}) × ${n(Q)} − ${n(F)} = ${n(prof)}.`,
            `Long run: the demand slope equals the AC slope, ${b} = ${n(F)}/Q², so Q = √(${n(F)}/${b}) = ${QL}.`,
          ],
        };
      },
    },
    {
      worked: 'w-edgeworth', topic: 'edgeworth',
      gen() {
        const Tx = pick([10, 20]), Ty = pick([10, 20, 30]), ex = int(1, Tx - 1), ey = int(1, Ty - 1);
        if (Math.abs(ey / ex - (Ty - ey) / (Tx - ex)) < 0.05) return this.gen();
        const p = Ty / Tx, XA = (p * ex + ey) / (2 * p);
        return {
          q: `Two consumers with U = √(XY) share ${Tx} units of X and ${Ty} of Y. A starts with (${ex}, ${ey}) and B with (${Tx - ex}, ${Ty - ey}).`,
          parts: [
            { label: 'A’s MRS at the endowment', answer: ey / ex },
            { label: 'Competitive equilibrium price ratio P_X/P_Y', answer: p },
            { label: 'A’s final quantity of X', answer: XA },
          ],
          solution: [
            `MRS_A = Y/X = ${ey}/${ex} = ${n(ey / ex)}; MRS_B = ${Ty - ey}/${Tx - ex} = ${n((Ty - ey) / (Tx - ex))}. They differ, so trade helps both.`,
            `Each spends half of wealth on X. Market clearing: (p·${Tx} + ${Ty})/(2p) = ${Tx}, so p = ${Ty}/${Tx} = ${n(p)}.`,
            `A’s wealth is ${n(p)} × ${ex} + ${ey} = ${n(p * ex + ey)}, so X_A = ${n(p * ex + ey)}/(2 × ${n(p)}) = ${n(XA)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-injections-leakages', topic: 'injections-leakages',
      gen() {
        const c = pick([0.75, 0.8, 0.9]), t = pick([0.2, 0.25]), z = pick([0.1, 0.2]), C0 = pick([20, 50, 100]), J = pick([100, 150, 200, 300]);
        const mpw = 1 - c * (1 - t) + z, Y = (C0 + J) / mpw;
        return {
          q: `C = ${C0} + ${c}Y_d, NT = ${t}Y, Z = ${z}Y and injections I + G + X = ${J}.`,
          parts: [
            { label: 'Equilibrium income Y*', answer: Y },
            { label: 'Multiplier', answer: 1 / mpw },
            { label: 'Net taxes at equilibrium', answer: t * Y },
          ],
          solution: [
            `MPW = 1 − c(1 − t) + z = 1 − ${n(c * (1 - t))} + ${z} = ${n(mpw)}. Leakages = −${C0} + ${n(mpw)}Y.`,
            `Injections = leakages: ${J} = −${C0} + ${n(mpw)}Y, so Y* = ${C0 + J}/${n(mpw)} = ${n(Y)}.`,
            `Multiplier = 1/${n(mpw)} = ${n(1 / mpw)}; NT = ${t} × ${n(Y)} = ${n(t * Y)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-phillips', topic: 'phillips',
      gen() {
        const pe = pick([1, 2, 3, 4]), g = pick([0.5, 1, 2]), us = pick([4, 5, 6]), u = us + pick([-2, -1, 1, 2]);
        const pi = pe - g * (u - us), pi2 = pi - g * (u - us), u3 = us + (pi2 - pe) / g;
        return {
          q: `π = πᵉ − ${g}(u − ${us}) with πᵉ = ${pe}% and actual unemployment u = ${u}%. Expectations are adaptive.`,
          parts: [
            { label: 'Inflation this year (%)', answer: pi },
            { label: 'Inflation next year if u stays the same (%)', answer: pi2 },
            { label: `Unemployment that then brings inflation back to ${pe}% in one year (%)`, answer: u3 },
          ],
          solution: [
            `π = ${pe} − ${g}(${u} − ${us}) = ${n(pi)}%.`,
            `Next year πᵉ = ${n(pi)}: π = ${n(pi)} − ${g}(${u} − ${us}) = ${n(pi2)}%.`,
            `${pe} = ${n(pi2)} − ${g}(u − ${us}) gives u = ${n(u3)}%.`,
          ],
        };
      },
    },
    {
      worked: 'w-real-gdp', topic: 'growth-measure',
      gen() {
        const q1 = 10 * int(15, 30), p1 = int(2, 6), q2 = 10 * int(8, 20), p2 = int(2, 6);
        const Q1 = q1 + 10 * int(1, 8), P1 = p1 + int(1, 4), Q2 = q2 + 10 * int(1, 6), P2 = p2 + int(1, 4);
        const N0 = q1 * p1 + q2 * p2, R1 = Q1 * p1 + Q2 * p2, N1 = Q1 * P1 + Q2 * P2;
        return {
          q: `An economy produces only apples and bread. In the base year it sold ${q1} apples at $${p1} and ${q2} loaves at $${p2}. Five years later it sold ${Q1} apples at $${P1} and ${Q2} loaves at $${P2}.`,
          parts: [
            { label: 'Real GDP in the later year at base-year prices ($)', answer: R1 },
            { label: 'Real GDP growth (%)', answer: 100 * (R1 / N0 - 1) },
            { label: 'GDP deflator in the later year', answer: (100 * N1) / R1 },
          ],
          solution: [
            `Base year: real = nominal = ${q1}(${p1}) + ${q2}(${p2}) = ${N0}.`,
            `Later year at base-year prices: ${Q1}(${p1}) + ${Q2}(${p2}) = ${R1}, so growth = ${R1}/${N0} − 1 = ${n(100 * (R1 / N0 - 1))}%.`,
            `Nominal GDP = ${Q1}(${P1}) + ${Q2}(${P2}) = ${N1}; deflator = ${N1}/${R1} × 100 = ${n((100 * N1) / R1)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-growth-measure', topic: 'growth-measure',
      gen() {
        const Y0 = pick([400, 500, 800]), ng = pick([5, 6, 8, 10]), inf = pick([1, 2, 3, 4]);
        const Y1 = Y0 * (1 + ng / 100), g = ((1 + ng / 100) / (1 + inf / 100) - 1) * 100;
        return {
          q: `Nominal GDP rises from £${Y0}bn to £${n(Y1)}bn while the GDP deflator rises from 100 to ${100 + inf}.`,
          parts: [
            { label: 'Real GDP growth (%)', answer: g },
            { label: 'Years to double at that rate (rule of 70)', answer: 70 / g },
          ],
          solution: [
            `Real GDP = ${n(Y1)}/${n(1 + inf / 100)} = ${n(Y1 / (1 + inf / 100))}; growth = ${n(g)}% (about ${ng} − ${inf} = ${ng - inf}%).`,
            `Rule of 70: 70/${n(g)} = ${n(70 / g)} years.`,
          ],
        };
      },
    },
    {
      worked: 'w-loanable-funds', topic: 'loanable-funds',
      gen() {
        const h = pick([1, 1.25, 2, 2.5]), k = pick([1, 1.25, 2, 2.5]), a = pick([0, 1, 2]), b = pick([8, 10, 12]), B = pick([1, 2, 3, 4]);
        const r1 = (h * a + k * b + B) / (h + k), I1 = k * (b - r1), crowd = (k * B) / (h + k);
        return {
          q: `Private saving is S = ${h}(r − ${a}) and private investment I = ${k}(${b} − r). The government borrows ${B}.`,
          parts: [
            { label: 'Equilibrium interest rate (%)', answer: r1 },
            { label: 'Private investment', answer: I1 },
            { label: 'Investment crowded out (fall from the balanced-budget level)', answer: crowd },
          ],
          solution: [
            `S = I + B: ${h}(r − ${a}) = ${k}(${b} − r) + ${B}, so r = (${n(h * a)} + ${n(k * b)} + ${B})/${n(h + k)} = ${n(r1)}%.`,
            `I = ${k}(${b} − ${n(r1)}) = ${n(I1)}.`,
            `Without borrowing r = ${n((h * a + k * b) / (h + k))}; investment falls by ${k} × ${B}/${n(h + k)} = ${n(crowd)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-lorenz', topic: 'lorenz',
      gen() {
        const s1 = int(3, 8), s2 = s1 + int(2, 6), s3 = s2 + int(2, 7), s4 = s3 + int(3, 10), s5 = 100 - s1 - s2 - s3 - s4;
        if (s5 < s4) return this.gen();
        const sh = [s1, s2, s3, s4, s5], cum = sh.map((_, i) => sh.slice(0, i + 1).reduce((x, y) => x + y, 0) / 100);
        const B = 0.1 * cum.reduce((acc, L, i) => acc + L + (i ? cum[i - 1] : 0), 0), G = 1 - 2 * B;
        return {
          q: `Income shares by quintile, poorest first, are ${sh.join('%, ')}%.`,
          parts: [
            { label: 'Gini coefficient (trapezium estimate)', answer: G },
            { label: 'S80/S20 ratio', answer: s5 / s1 },
          ],
          solution: [
            `Cumulative shares: ${cum.map((v) => n(v * 100)).join('%, ')}%.`,
            `Area under the Lorenz curve B = 0.1 × (sum of adjacent cumulative pairs) = ${n(B, 3)}. Gini = 1 − 2B = ${n(G, 3)}.`,
            `S80/S20 = ${s5}/${s1} = ${n(s5 / s1)}.`,
          ],
        };
      },
    },
  ];

  const concepts = [
    { worked: 'w-elastic-inelastic', topic: 'elastic-inelastic', q: 'A firm faces elastic demand at its current price. To raise total revenue it should…', choices: ['Raise its price', 'Cut its price', 'Leave price alone: revenue cannot change', 'Raise both price and output'], correct: 1, why: 'With PED < −1 (|PED| > 1), the percentage rise in quantity outweighs the percentage fall in price, so revenue rises when price is cut.' },
    { worked: 'w-elastic-inelastic', topic: 'elastic-inelastic', q: 'Two straight-line demand curves pass through the same point. At that point the flatter one is…', choices: ['Less elastic', 'More elastic', 'Equally elastic, because elasticity is the slope', 'Unit elastic'], correct: 1, why: 'At a shared point P/Q is the same, so PED = (dQ/dP)(P/Q) is larger in size on the curve where quantity responds more to price: the flatter one.' },
    { worked: 'w-elastic-inelastic', topic: 'elastic-inelastic', q: 'Demand for a good is perfectly inelastic. Its price rises by 10%. Spending on it…', choices: ['Falls by 10%', 'Rises by 10%', 'Is unchanged', 'Falls to zero'], correct: 1, why: 'Quantity does not change, so spending rises in proportion to the price.' },
    { worked: 'w-income-elasticity', topic: 'income-elasticity', q: 'As incomes rise, people buy more of a good but it takes a smaller share of their spending. The good is…', choices: ['A luxury', 'A necessity', 'Inferior', 'Giffen'], correct: 1, why: 'Quantity rising means IED > 0; the share falling means quantity rises more slowly than income, so 0 < IED < 1.' },
    { worked: 'w-income-elasticity', topic: 'income-elasticity', q: 'A recession cuts incomes. Which demand curve is most likely to shift right?', choices: ['Foreign holidays', 'Restaurant meals', 'Value-range own-brand food', 'New cars'], correct: 2, why: 'Inferior goods have negative income elasticity: when incomes fall, demand for them rises.' },
    { worked: 'w-market-demand', topic: 'market-demand', q: 'Market demand for a private good is found by…', choices: ['Adding prices at each quantity (vertical summation)', 'Adding quantities at each price (horizontal summation)', 'Averaging the individual demand curves', 'Taking the highest individual demand curve'], correct: 1, why: 'At a given price each buyer chooses a quantity, and the market quantity is their sum. Vertical summation is for public goods, which everyone consumes together.' },
    { worked: 'w-market-demand', topic: 'market-demand', q: 'Market demand built from two linear individual demands has a kink because…', choices: ['The goods are complements', 'Below the second buyer’s choke price that buyer joins the market, so demand becomes flatter', 'The firm price discriminates', 'Demand becomes perfectly elastic'], correct: 1, why: 'Above the lower choke price only one buyer is in the market; below it both are, so quantity responds more to price.' },
    { worked: 'w-demand-derivation', topic: 'demand-derivation', q: 'The price–consumption curve for X is horizontal. Demand for X is…', choices: ['Elastic', 'Unit elastic', 'Inelastic', 'Perfectly inelastic'], correct: 1, why: 'Y does not change, so spending on Y and therefore spending on X are the same at every price of X: unit elasticity.' },
    { worked: 'w-demand-derivation', topic: 'demand-derivation', q: 'Each point on an individual demand curve shows…', choices: ['A bundle the consumer cannot afford', 'The quantity of X in the utility-maximising bundle at that price of X', 'The quantity where the marginal utility of X is zero', 'The quantity that minimises spending'], correct: 1, why: 'Holding income, other prices and preferences fixed, the demand curve records the optimal X at each price of X.' },
    { worked: 'w-engel-derivation', topic: 'engel-derivation', q: 'The income–consumption curve bends back towards the Y axis as income rises. Then X is…', choices: ['A luxury', 'A necessity', 'Inferior', 'Always a Giffen good'], correct: 2, why: 'Less X at higher income means a negative income elasticity. It is a Giffen good only if, in addition, the income effect of a price change outweighs the substitution effect.' },
    { worked: 'w-engel-derivation', topic: 'engel-derivation', q: 'An Engel curve is drawn holding constant…', choices: ['Income', 'Prices and preferences', 'The quantity of X', 'Utility'], correct: 1, why: 'It plots the quantity bought against income, so prices and preferences must stay fixed.' },
    { worked: 'w-cost-curves', topic: 'cost-curves', q: 'Marginal cost cuts AVC and ATC…', choices: ['At their maximum points', 'At their minimum points', 'Where total cost is lowest', 'Only in the long run'], correct: 1, why: 'When MC is below an average it pulls the average down; when above, it pulls it up. So MC crosses each average at its minimum.' },
    { worked: 'w-cost-curves', topic: 'cost-curves', q: 'As output rises, the vertical gap between ATC and AVC…', choices: ['Grows', 'Shrinks, because AFC = F/Q falls', 'Stays constant', 'Equals MC'], correct: 1, why: 'The gap is average fixed cost, which falls as the same fixed cost is spread over more units.' },
    { worked: 'w-cost-curves', topic: 'cost-curves', q: 'For a cubic total cost curve, marginal cost is lowest…', choices: ['At the inflection point of TC', 'Where TC is lowest', 'Where ATC is lowest', 'At zero output'], correct: 0, why: 'MC is the slope of TC, and the slope is smallest where TC turns from concave to convex.' },
    { worked: 'w-lac-envelope', topic: 'lac-envelope', q: 'At outputs below minimum efficient scale on a U-shaped LAC…', choices: ['LMC is above LAC: diseconomies of scale', 'LMC is below LAC: economies of scale', 'LMC equals LAC', 'SAC is below LAC'], correct: 1, why: 'LAC is falling, which needs the marginal cost to be below the average.' },
    { worked: 'w-lac-envelope', topic: 'lac-envelope', q: 'Why does every SAC curve lie on or above the LAC curve?', choices: ['Fixed costs are higher in the long run', 'In the long run the firm can choose the best plant for each output, so it never does worse than with a given plant', 'SAC includes only variable costs', 'LAC ignores fixed costs'], correct: 1, why: 'LAC is the lowest cost of each output when every input can vary, so it is the lower envelope of all the SAC curves.' },
    { worked: 'w-lr-industry', topic: 'lr-industry', q: 'In a constant-cost competitive industry, a permanent rise in demand in the long run…', choices: ['Raises the price permanently', 'Leaves price at minimum ATC and raises the number of firms', 'Raises each firm’s output permanently', 'Lets firms keep supernormal profit'], correct: 1, why: 'Profit attracts entry until price is back at minimum ATC. Industry output rises through more firms, each producing at its efficient scale.' },
    { worked: 'w-lr-industry', topic: 'lr-industry', q: 'The long-run supply curve of an increasing-cost industry slopes up because…', choices: ['Firms collude', 'Entry bids up input prices, raising every firm’s cost curves', 'Demand is elastic', 'Each firm produces less'], correct: 1, why: 'As the industry expands it pays more for scarce inputs, so minimum ATC, and with it the long-run price, rises.' },
    { worked: 'w-monopolistic-competition', topic: 'monopolistic-competition', q: 'In long-run equilibrium under monopolistic competition…', choices: ['P = MC = minimum AC', 'P = AC on the falling part of AC, and P > MC', 'Firms make supernormal profit', 'P is below AC'], correct: 1, why: 'Entry removes profit, so demand is tangent to AC. Demand slopes down, so the tangency is on the falling part of AC, and P > MR = MC.' },
    { worked: 'w-monopolistic-competition', topic: 'monopolistic-competition', q: 'Excess capacity in monopolistic competition means firms…', choices: ['Produce more than the efficient scale', 'Produce less than the output that minimises average cost', 'Hold unsold stock', 'Build plants too small to meet demand'], correct: 1, why: 'At the tangency AC is still falling, so each firm could lower its average cost by producing more.' },
    { worked: 'w-edgeworth', topic: 'edgeworth', q: 'An allocation inside the Edgeworth box is Pareto efficient when…', choices: ['Both consumers have the same bundle', 'Their MRSs are equal, so their indifference curves are tangent', 'One consumer has everything', 'Both goods have the same price'], correct: 1, why: 'If the MRSs differ, a trade between them makes both better off; when they are equal no such trade exists.' },
    { worked: 'w-edgeworth', topic: 'edgeworth', q: 'The first fundamental theorem of welfare economics says…', choices: ['Every Pareto-efficient allocation is fair', 'A competitive equilibrium is Pareto efficient (under its assumptions)', 'Trade makes everyone equally well off', 'The government must redistribute endowments'], correct: 1, why: 'Everyone faces the same prices and sets MRS equal to the price ratio, so all MRSs are equal. Efficiency says nothing about fairness.' },
    { worked: 'w-injections-leakages', topic: 'injections-leakages', q: 'In an economy with government and trade, equilibrium income is where…', choices: ['Saving equals investment', 'Planned injections equal planned leakages', 'Taxes equal government spending', 'Exports equal imports'], correct: 1, why: 'S need not equal I: it is I + G + X = S + NT + Z that must hold.' },
    { worked: 'w-injections-leakages', topic: 'injections-leakages', q: 'A rise in the marginal propensity to import…', choices: ['Raises the multiplier', 'Lowers the multiplier', 'Leaves it unchanged', 'Makes it negative'], correct: 1, why: 'More of each extra pound leaks abroad, so the marginal propensity to withdraw rises and the multiplier 1/MPW falls.' },
    { worked: 'w-injections-leakages', topic: 'injections-leakages', q: 'Households try to save more at every income while injections stay fixed. In the new equilibrium…', choices: ['Total leakages rise by the full extra saving', 'Total leakages end unchanged, because income falls until they again equal injections', 'Income rises', 'Injections rise to match'], correct: 1, why: 'This is the paradox of thrift: leakages must equal the unchanged injections, so the attempt to save more lowers income instead.' },
    { worked: 'w-phillips', topic: 'phillips', q: 'With adaptive expectations, holding unemployment below the natural rate causes…', choices: ['A permanent fall in inflation', 'Steadily rising inflation', 'Stable inflation at a higher level', 'Ever-falling unemployment'], correct: 1, why: 'Each year expectations catch up with last year’s inflation, the SRPC shifts up, and inflation rises again.' },
    { worked: 'w-phillips', topic: 'phillips', q: 'The long-run Phillips curve is…', choices: ['Downward-sloping', 'Vertical at the natural rate', 'Horizontal at expected inflation', 'Upward-sloping'], correct: 1, why: 'In the long run π = πᵉ, which happens only at u = u*, whatever the inflation rate.' },
    { worked: 'w-phillips', topic: 'phillips', q: 'An adverse supply shock shifts the short-run Phillips curve…', choices: ['Down', 'Up', 'Along itself', 'Not at all'], correct: 1, why: 'v > 0 raises inflation at every unemployment rate.' },
    { worked: 'w-real-gdp', topic: 'growth-measure', q: 'With 2010 as the base year, real GDP in 2015 values…', choices: ['2015 quantities at 2015 prices', '2015 quantities at 2010 prices', '2010 quantities at 2015 prices', '2010 quantities at 2010 prices'], correct: 1, why: 'Holding prices at their base-year level leaves only changes in quantities. 2015 quantities at 2015 prices is nominal GDP.' },
    { worked: 'w-real-gdp', topic: 'growth-measure', q: 'The rate of inflation is…', choices: ['The value of the consumer price index', 'The rise in the consumer price index, in points', 'The percentage change in the consumer price index', 'The consumer price index minus 100'], correct: 2, why: 'Inflation is the percentage change in the price level. A CPI rising from 120 to 126 is a 6-point rise but 5% inflation.' },
    { worked: 'w-growth-measure', topic: 'growth-measure', q: 'Nominal GDP grew 6% and the GDP deflator rose 4%. Real GDP grew by about…', choices: ['10%', '2%', '6%', '1.5%'], correct: 1, why: 'Real growth ≈ nominal growth − inflation = 6 − 4 = 2% (exactly 1.06/1.04 − 1 = 1.9%).' },
    { worked: 'w-growth-measure', topic: 'growth-measure', q: 'By the rule of 70, an economy growing at 2% a year doubles in about…', choices: ['14 years', '35 years', '70 years', '140 years'], correct: 1, why: '70/2 = 35 years.' },
    { worked: 'w-growth-measure', topic: 'growth-measure', q: 'Why can the CPI overstate the rise in the cost of living?', choices: ['It includes imports', 'Its fixed basket ignores consumers switching to goods that have become relatively cheaper', 'It leaves out services', 'It counts exports'], correct: 1, why: 'This is substitution bias. New goods and quality improvements bias it upward too.' },
    { worked: 'w-loanable-funds', topic: 'loanable-funds', q: 'A budget deficit in a closed economy, with saving that responds to the interest rate,…', choices: ['Lowers the interest rate', 'Raises the interest rate and crowds out some private investment', 'Crowds out investment one-for-one', 'Has no effect on investment'], correct: 1, why: 'Government borrowing shifts demand for funds right. The higher rate draws out more saving and cuts some investment.' },
    { worked: 'w-loanable-funds', topic: 'loanable-funds', q: 'Crowding out is complete (investment falls by the full deficit) when…', choices: ['Saving is perfectly elastic to the interest rate', 'Saving does not respond to the interest rate', 'Investment does not respond to the interest rate', 'The economy is open'], correct: 1, why: 'With a vertical supply of funds, every pound the government borrows must come out of private investment.' },
    { worked: 'w-lorenz', topic: 'lorenz', q: 'A Gini coefficient of 0 means…', choices: ['One person has all the income', 'Income is shared perfectly equally', 'Half the population has no income', 'The Lorenz curve lies above the diagonal'], correct: 1, why: 'The Lorenz curve then coincides with the line of equality, so the area between them is zero.' },
    { worked: 'w-lorenz', topic: 'lorenz', q: 'Two Lorenz curves cross. Then…', choices: ['The one with the lower Gini is unambiguously more equal', 'Neither is unambiguously more equal: different measures can rank them differently', 'They must have the same Gini', 'One of them has a negative Gini'], correct: 1, why: 'One distribution is more equal at the bottom and the other at the top; the Gini weights these in one particular way.' },
  ];

  window.WORKED.push(...worked);
  // Course order: sort worked answers by their topic's position (stable, so each topic keeps its own order).
  const pos = Object.fromEntries((window.TOPICS || []).map((t, i) => [t.id, i]));
  const idx = new Map(window.WORKED.map((w, i) => [w, i]));
  window.WORKED.sort((a, b) => (pos[a.topic] ?? 1e9) - (pos[b.topic] ?? 1e9) || idx.get(a) - idx.get(b));

  window.QUIZ.items.push(
    ...generators.map((g) => ({ key: 'calc:' + g.worked, kind: 'calc', worked: g.worked, topic: g.topic, make: () => g.gen() })),
    ...concepts.map((c) => ({ key: `concept:${c.worked}:${c.q.slice(0, 60)}`, kind: 'concept', worked: c.worked, topic: c.topic, make: () => ({ q: c.q, parts: [{ label: 'Choose one', choices: c.choices, correct: c.correct }], solution: [c.why] }) })),
  );
})();
