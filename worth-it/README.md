# Worth It?

A "should I buy it?" calculator, made for Sri Lanka. It shows prices in rupees and lets you type amounts the way people say them: `150,000`, `1.5 lakhs`, `2mn` or `25k`.

Open `index.html` in a browser. There's no build step and nothing to install.

## What it does

**Should I buy?** Enter a price, how often you'll use the thing, how long it will last and what you could sell it for. You get three numbers:

- **Cost per use:** (price − resale value) ÷ number of uses
- **Hours of your work:** price ÷ your hourly pay, worked out from your monthly take-home salary
- **If you invested it:** what the money would grow to in a fixed deposit, treasury bills, a unit trust or CSE shares, also shown in today's money after inflation

The verdict is based on how many minutes of your work each use costs. Under 20 minutes counts as "worth it". A chart shows the cost per use falling as you use the thing more.

For regular spending (coffee, short eats, ride-hailing), it shows the cost per month and per year, its share of your salary, and spending against investing over time.

Items priced in US dollars are converted at your exchange rate, and the app shows what happens if the rupee weakens 10%.

**Wishlist:** save things you're considering and look again later.

**Easy payment checker:** for credit card instalment plans, "0% easy payment" offers and leases. Enter the cash price, the monthly payment, the number of months, any down payment and any fee. It shows:

- the total you pay and the extra over the cash price
- the **flat rate**, which is how plans are usually advertised
- the **true interest rate**, the annual rate at which the payments repay what you really borrowed
- how many months it would take to save up and pay cash instead

**Settings:** your salary and hours, which investment to compare with and at what rate, expected inflation, the dollar rate, and whether to show amounts in lakhs.

Interest rates are examples only. Put in today's rates from your bank or CBSL.

## On your phone

Turn on GitHub Pages for this repo, open `…/worth-it/` on your phone and choose **Add to Home Screen**. It runs like an app and works offline, using `sw.js` and `manifest.webmanifest`. Everything you enter stays in the browser's local storage on that device.

## Files

```
index.html            page
styles.css            theme (light and dark) and layout
calc.js               all the maths, with no page code, so it can be tested
app.js                inputs, results, chart, wishlist, saving
sw.js                 offline cache (bump CACHE when files change)
manifest.webmanifest  home-screen app details
icon.svg, icon-*.png  app icon
test/calc.test.js     tests for calc.js
```

Run the tests with:

```bash
node --test worth-it/test/calc.test.js
```
