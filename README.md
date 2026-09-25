# Marginal Notes

An interactive study kit for the core graphs and equations of economics. Open `index.html` in a browser; there is no build step and no install.

## What's inside

30 topics. The first 25 follow the EC1002 subject guide block by block, and each is tagged with its block. Every topic has a graph you can change with sliders, its key equations, points to remember and an exam tip.

| Part | Topics |
| --- | --- |
| Microeconomics (Blocks 1–10) | PPF (linear and concave), supply and demand, price ceilings and floors, elasticities, tax incidence, consumer choice, income and substitution effects, market demand by horizontal summation, isoquants and isocosts, short-run costs and perfect competition, LAC envelope, monopoly, monopolistic competition, Cournot duopoly, labour demand (MRP), Edgeworth box, externalities |
| Macroeconomics (Blocks 11–20) | Circular flow and national income, Solow growth, Keynesian cross and multipliers, injections and leakages, IS–MP, AD–AS with shock adjustment, Phillips curve, foreign exchange (floating and fixed) |
| Further topics | Price indices and growth rates, money market, loanable funds, Lorenz curve, tariffs |

Notation follows the guide: M for income in micro, Z for imports and NT for net taxes in macro, (n + d + g) in Solow, γ in SRAS and the Phillips curve.

## Modes

- **Graphs**: move the sliders to shift curves. Equilibria, surplus areas, deadweight loss and other values update live.
- **Formula sheet**: every equation on one filterable page.
- **Flashcards**: name → formula or formula → name, by unit. Keys: `Space` reveals, `1` again, `2` got it.

Mark a topic as mastered to track progress. Progress is kept in your browser's local storage.

## Project layout

```
index.html        page shell
styles.css        theme (light and dark) and layout
js/engine.js      SVG graph renderer
js/topics.js      core study content and shared graph helpers
js/syllabus.js    EC1002 topics, course order and block numbers
js/app.js         navigation, formula sheet, flashcards
scripts/build.mjs bundles everything into dist/marginal-notes.html
```

To add a topic, add an object to `js/syllabus.js` with a `graph` (axes, `params`, `draw`, `readout`, optional `actions`) or a static `diagram`, plus a list of `equations` in TeX, and list its id in `ORDER`. A param with `options` renders as a toggle instead of a slider; `_X` in labels renders as a subscript.

Equations are rendered by KaTeX (loaded from cdnjs) as MathML. Without a network connection they fall back to plain TeX source.

Run `node scripts/build.mjs` to produce a single self-contained HTML file.
