# Marginal Notes

An interactive study kit for the core graphs and equations of economics. Open `index.html` in a browser; there is no build step and no install.

## What's inside

20 topics across four units, each with an interactive graph, its key equations, points to remember and an exam tip.

| Unit | Topics |
| --- | --- |
| Foundations | Production possibilities frontier, comparative advantage |
| Microeconomics | Supply and demand, elasticity, price ceilings and floors, tax incidence, consumer choice, costs and perfect competition, monopoly, externalities, Lorenz curve and Gini |
| Macroeconomics | Measuring output and growth, AD–AS, Keynesian cross and multipliers, money market, loanable funds, IS–LM, Phillips curve, Solow growth |
| International | Tariffs and trade, exchange rates |

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
js/topics.js      all study content: graphs, equations, notes
js/app.js         navigation, formula sheet, flashcards
scripts/build.mjs bundles everything into dist/marginal-notes.html
```

To add a topic, append an object to `js/topics.js` with a `graph` (axes, slider `params`, `draw`, `readout`) and a list of `equations` in TeX.

Equations are rendered by KaTeX (loaded from cdnjs) as MathML. Without a network connection they fall back to plain TeX source.

Run `node scripts/build.mjs` to produce a single self-contained HTML file.
