# Marginal Notes

An interactive study kit for the core graphs and equations of economics. Open `index.html` in a browser; there is no build step and no install.

## What's inside

77 topics. The first 72 follow the EC1002 subject guide block by block, and each is tagged with its block. Every topic has a graph you can change with sliders, its key equations, points to remember and an exam tip.

| Part | Topics |
| --- | --- |
| Microeconomics (Blocks 1–10) | PPF (linear and concave), supply and demand, price ceilings and floors, elasticities, elastic and inelastic demand compared (including the perfectly elastic and inelastic extremes), income elasticity (Engel curves and demand shifts for normal and inferior goods), tax incidence, consumer choice, income and substitution effects (normal, inferior and Giffen goods, with the demand curve each implies), deriving the Engel curve from the income–consumption curve (normal and inferior goods), market demand by horizontal summation, isoquants and isocosts, total cost curves above per-unit cost curves, short-run costs and perfect competition (all five short-run cases), LAC envelope (U-shaped, L-shaped, flat, falling, rising), perfect competition in the long run (constant, increasing and decreasing cost industries), monopoly, price discrimination (perfect and third degree), natural monopoly and regulation (none, P = MC, P = AC), barriers to entry and limit pricing (deterred, entry, blockaded), contestable markets (sunk costs and hit-and-run entry), monopolistic competition, Cournot duopoly, Bertrand price competition (identical and differentiated goods), Stackelberg leader and follower, kinked demand curve, game theory (payoff matrices, Nash equilibrium, entry game), prisoner’s dilemma and repeated games, collusion and cartels (quotas, the incentive to cheat, cartel stability), dominant-firm price leadership, oligopoly models compared (monopoly, Cournot with n firms, Stackelberg, Bertrand), deriving labour demand from MVP (total product above MVP, with MRP below MVP under monopoly), labour demand (MRP), monopsony (MFC above supply, minimum wage effects), bilateral monopoly (union bargaining with a monopsony employer), wage differentials (compensating and disequilibrium, two-sector diagram), human capital (age–earnings profiles, NPV and rate of return), trade unions (union wage, restricted supply, raised demand), efficiency wages (Solow condition and involuntary unemployment), labour market discrimination (Becker employer discrimination), labour market policy (minimum wage, wage subsidy, tax on labour, benefits), Edgeworth box, externalities, price elasticity of supply (elastic, unit and inelastic supply), cross-price elasticity (substitutes and complements), subsidies (incidence, cost and deadweight loss), perfect substitutes and perfect complements, intertemporal choice (saving and borrowing), labour–leisure choice and backward-bending labour supply, positive externalities and corrective subsidies, public goods and free riding, the tragedy of the commons, the market for lemons (adverse selection) |
| Macroeconomics (Blocks 11–20) | Circular flow and national income (GDP measured as spending, as income and as leakages against injections), Solow growth, Keynesian cross and multipliers, injections and leakages, money and banking (Block 14), IS–MP, AD–AS with shock adjustment, unemployment (measurement, types, flows and the steady state), the natural rate (WS–PS model), Phillips curve, foreign exchange (floating and fixed), demand-pull and cost-push inflation, the Laffer curve, investment demand and the liquidity trap, interest rate parity, the J-curve and the Marshall–Lerner condition |
| Further topics | Price indices and growth rates, loanable funds, Lorenz curve, tariffs, import quotas (quota rent and voluntary export restraints) |

Notation follows the subject guide: M for income in micro, Z for imports and NT for net taxes in macro, (δ + n + t) in Solow, α for aggregate supply (Y = Y* + α(π − πᵉ)), b for the slope of the Phillips curve (b = h/α, with h Okun’s coefficient), and j and h for the job-loss and hiring rates. The AD–AS graphs plot inflation, not the price level, as the guide does.

## Your own supply and demand

Six graphs are built from demand and supply functions you type in: supply and demand, price ceilings and floors, tax incidence, externalities, tariffs, and the foreign exchange market. Enter each line in either form, for example `Qd = 120 - 10P` or `P = 2 + 0.1Q` (use `e` for the exchange rate). The app checks that demand slopes down, supply slopes up, and a market exists (buyers' highest price is above sellers' lowest price at a positive equilibrium price).

Sliders scale to your market and stop at the last valid value. For example, a specific tax stops before it closes the market or pushes sellers' price below zero, and a tariff stops at the prohibitive level. The status line says which limit was reached.

## Limits of feasibility

Every slider on every graph runs over the full economic domain of its variable (prices and costs from zero, elasticities positive, discount factors below one, shares between 0 and 1) and stops only where the model stops making sense. Each topic has its own economic limits (a tax that closes the market, a peg that cannot hold, a cartel that would produce nothing), and on top of those every graph is checked for:

- a negative price, quantity, wage or output on an axis that starts at zero: the market would not exist;
- an undefined value (no solution to the model);
- an outcome far beyond any sensible scale for the diagram (more than three chart-widths off the original axes).

The slider stops at the last feasible value and the status line says why. Axes grow automatically when an outcome moves beyond them, and linked panels keep their shared axis in step.

## Linked graphs

Some topics draw two diagrams driven by the same sliders, side by side on a shared vertical axis or stacked on a shared horizontal axis:

- Perfect competition in the long run: typical firm beside the industry (shared price axis)
- Labour market: market wage-setting beside one firm's hiring, with an optional minimum wage
- Monopolistic competition: short run beside long run
- Money market beside IS–MP (shared interest-rate axis), switchable to a fixed money supply to show LM
- AD–AS beside the Phillips curve (shared inflation axis, linked by Okun's law)
- Keynesian cross above injections and leakages (shared income axis)
- Deriving the demand curve: price–consumption curve above the demand curve (shared X axis)
- Deriving the Engel curve: income–consumption curve above the Engel curve, for a normal or an inferior good (shared X axis)
- Income elasticity: Engel curves for a normal and an inferior good above the demand shifts they imply (shared quantity axis)
- Elastic beside inelastic demand through the same point, with revenue gained and lost from a price change (shared price axis)
- Total cost curves above per-unit cost curves (shared output axis)
- Labour–leisure choice beside the backward-bending labour supply curve it implies
- Cross-price elasticity: a price change in one market beside the demand shift in the related market
- Money market beside investment demand, showing the liquidity trap (shared interest-rate axis)
- Deriving labour demand: total product above MVP (or MRP under monopoly), with the wage picking the number of workers (shared labour axis)
- Collusion: the cartel in the industry beside one member’s residual demand and its incentive to cheat (shared price axis)
- Efficiency wages: the firm’s effort curve beside the labour market and the unemployment the efficiency wage causes
- Oligopoly comparisons: four models on one demand curve beside the Cournot price as the number of firms grows (shared price axis)
- Income and substitution effects above the demand curve each type of good implies (normal, inferior, Giffen)

## Revision

The **Revision** tab has one sheet per block of the EC1002 subject guide (Blocks 6–8, 17–18 and 19–20 share a sheet). A **Beyond the guide** sheet collects the topics outside the guide: price indices and growth rates, loanable funds and the Lorenz curve, which it does not cover, and the kinked demand curve, contestable markets, wage discrimination, interest parity and trade policy, which it excludes. Each sheet has:

- a "you should be able to" checklist to tick off (119 statements in all; the 11 on block sheets that go beyond the guide are tagged)
- the key equations for that block, checked against the guide and the textbook sections and maths boxes it assigns (95 from the guide or those boxes, plus 20 that the app uses but the guide does not give or marks as not examinable, listed separately under "Beyond the guide"; the Beyond the guide sheet has 6 more)
- the graphs to practise, each linked to its interactive topic and tagged if the graph, or part of it, goes beyond the guide (the topic page says why)
- exam focus points, the block's worked answers and key terms
- a **Test this block** button that starts a 6-question quiz on the block's topics

Above the sheets:

- **Readiness dashboard**: checklist progress, overall quiz accuracy, and the weakest topics with a Drill link for each.
- **Spaced review**: every checked quiz question is scheduled. A fully correct answer comes back after 1, 3, 7, 14 then 30 days; a wrong one is due again today. **Review due questions** runs a quiz from the due queue.
- **Exam plan**: enter the exam date and the sheets are spread across the days left, with the last fifth kept for mixed review.

Topic pages link to the sheet that covers them. Progress, results and the exam date are kept in this browser's local storage; **Reset revision progress** clears them (click twice to confirm).

## Reference and practice

- **Glossary**: 353 key terms with plain-language definitions, checked against the textbook glossary and the guide (terms for content the guide excludes say so), an A–Z bar and a filter. Each term links to the topics that use it, and each topic page lists its key terms. Link to a term with `#g-<term>`, for example `#g-opportunity-cost`.
- **Worked answers**: 79 exam-style run-throughs (74 calculations, 5 diagram answers), at least one for every topic, revealed one step at a time and ending with the final answer and common mistakes. Each also appears on its topic page. Filter by unit or question type. Every answer was checked against the guide and its assigned textbook reading; 15 that go beyond the guide, and 6 with one part that does, carry a note saying so.
- **Quiz**: 194 question types built on the worked answers. 66 calculation types generate new numbers every time, so you practise the method rather than the example; 128 concept questions are multiple choice. Choose 5, 10 or 15 questions by area and type, and choose the scope: EC1002 guide only (the default, 157 question types) or including the 37 that go beyond the guide. Numeric answers are accepted within 1%. Each answer shows the solution and links to the full run-through; the results screen lets you retry missed questions with fresh numbers. Every worked answer has a "Practise with new numbers" button that starts a three-question drill.
- **Definition flashcards**: the Flashcards page has a Definitions deck (term → definition or definition → term) alongside the formula deck; in guide-only scope it leaves out the 15 terms for content the guide excludes.

## Modes

- **Graphs**: move the sliders to shift curves. Equilibria, surplus areas, deadweight loss and other values update live.
- **Formula sheet**: every equation on one filterable page. Each was checked against the guide and its assigned textbook reading: by default the sheet shows the 248 in the EC1002 syllabus; switch to “Include beyond the guide” to add the other 87, each marked with the reason.
- **Flashcards**: name → formula or formula → name, by unit, with the same scope switch (EC1002 guide only by default). Keys: `Space` reveals, `1` again, `2` got it.

Mark a topic as mastered to track progress. Progress is kept in your browser's local storage.

## Project layout

```
index.html        page shell
styles.css        theme (light and dark) and layout
js/engine.js      SVG graph renderer
js/topics.js      core study content and shared graph helpers
js/syllabus.js    EC1002 topics, course order and block numbers
js/markets.js     supply-and-demand graphs driven by user-entered functions
js/linked.js      two-panel linked graphs
js/extra-topics.js elastic vs inelastic demand, income elasticity, the Engel curve derivation, total/per-unit cost curves, price discrimination, Bertrand, Stackelberg, kinked demand, entry barriers, contestable markets
js/games.js       game theory, the prisoner's dilemma (interactive payoff matrices), collusion and cartels
js/oligopoly.js   price leadership and the oligopoly comparison
js/labour.js      labour demand from MVP, monopsony, bilateral monopoly, wage differentials, human capital, trade unions, efficiency wages, discrimination, labour market policy
js/unemployment.js unemployment flows and types, the natural rate (WS–PS)
js/more-micro.js  elasticity of supply, cross-price elasticity, subsidies, perfect substitutes and complements, intertemporal choice, labour–leisure choice, positive externalities, public goods, the commons, the market for lemons, import quotas
js/more-macro.js  demand-pull and cost-push inflation, the Laffer curve, investment demand and the liquidity trap, interest rate parity, the J-curve
js/glossary.js    reference glossary of key terms
js/worked.js      step-by-step worked answers
js/quiz.js        quiz question generators and concept questions
js/practice.js    worked answers and quiz questions for the remaining topics
js/vendor/        KaTeX (MIT licence), bundled so equations render offline
js/revision.js    block revision sheets checked against the EC1002 subject guide
js/app.js         navigation, formula sheet, flashcards
scripts/build.mjs bundles everything into dist/marginal-notes.html
```

To add a topic, add an object to `js/syllabus.js` with a `graph` (axes, `params`, `draw`, `readout`, optional `actions`) or a static `diagram`, plus a list of `equations` in TeX, and list its id in `ORDER`. A param with `options` renders as a toggle instead of a slider; `_X` in labels renders as a subscript.

Equations are rendered as MathML by KaTeX, which is bundled in `js/vendor/`, so they work without a network connection.

Run `node scripts/build.mjs` to produce a single self-contained HTML file.
