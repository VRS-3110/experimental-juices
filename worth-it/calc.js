/* Worth It? — the maths, kept free of the page so it can be tested with Node.
   Rates are decimals (0.08 = 8%). Amounts are rupees. */
(function (root) {
  'use strict';

  const PER_YEAR = { day: 365, week: 52, month: 12, year: 1 };
  const SUFFIX = { k: 1e3, l: 1e5, lac: 1e5, lacs: 1e5, lakh: 1e5, lakhs: 1e5, m: 1e6, mn: 1e6, million: 1e6 };

  /* Reads what people actually type: "150,000", "Rs. 150000", "1.5 lakhs", "1.5L", "2mn", "25k". */
  function parseAmount(input) {
    if (typeof input === 'number') return input;
    let s = String(input == null ? '' : input).trim().toLowerCase();
    s = s.replace(/^(rs\.?|lkr|\$|usd)\s*/, '').replace(/[,\s]/g, '');
    if (!s) return NaN;
    const m = s.match(/^(\d*\.?\d+)([a-z]+)?$/);
    if (!m) return NaN;
    if (m[2] && !SUFFIX[m[2]]) return NaN;
    return parseFloat(m[1]) * (m[2] ? SUFFIX[m[2]] : 1);
  }

  /* Monthly take-home pay → pay per hour worked. */
  function hourlyRate(monthlySalary, hoursPerWeek) {
    if (!(monthlySalary > 0) || !(hoursPerWeek > 0)) return NaN;
    return (monthlySalary * 12) / (hoursPerWeek * 52);
  }

  /* A lump sum left to grow at an annual rate. */
  function futureValue(amount, annualRate, years) {
    return amount * Math.pow(1 + annualRate, years);
  }

  /* Money paid in every month, growing at an annual rate (compounded monthly). */
  function futureValueMonthly(monthly, annualRate, years) {
    const n = Math.round(years * 12);
    const i = Math.pow(1 + annualRate, 1 / 12) - 1;
    if (Math.abs(i) < 1e-12) return monthly * n;
    return monthly * (Math.pow(1 + i, n) - 1) / i;
  }

  /* What a future amount is worth in today's rupees. */
  function inTodaysMoney(amount, inflation, years) {
    return amount / Math.pow(1 + inflation, years);
  }

  /* Interest after inflation. */
  function realRate(nominal, inflation) {
    return (1 + nominal) / (1 + inflation) - 1;
  }

  /* A one-off purchase: cost per use, hours of work, and the uses needed to hit a target. */
  function oneOff({ price, resale = 0, uses, per, years, hourly, targetMinutes = 20 }) {
    const usesPerYear = (uses > 0 ? uses : 0) * (PER_YEAR[per] || 0);
    const totalUses = usesPerYear * (years > 0 ? years : 0);
    const net = price - (resale > 0 ? resale : 0);
    const costPerUse = totalUses > 0 ? Math.max(net, 0) / totalUses : null;
    const minutesPerUse = costPerUse == null ? null : (costPerUse / hourly) * 60;
    const targetCost = (hourly * targetMinutes) / 60;
    const usesForTarget = net > 0 ? Math.ceil(net / targetCost) : 0;
    return {
      price, net, usesPerYear, totalUses, costPerUse, minutesPerUse,
      hoursOfWork: price / hourly, targetCost, usesForTarget,
    };
  }

  /* Something bought again and again, like coffee or short eats. */
  function habit({ cost, times, per, hourly, salary }) {
    const perYear = cost * times * (PER_YEAR[per] || 0);
    const perMonth = perYear / 12;
    return {
      perYear, perMonth,
      hoursPerYear: perYear / hourly,
      shareOfSalary: salary > 0 ? perMonth / salary : null,
    };
  }

  /* Monthly rate i where the payments' present value equals the amount borrowed. */
  function solveMonthlyRate(borrowed, payment, months) {
    const pv = (i) => (Math.abs(i) < 1e-12 ? payment * months : payment * (1 - Math.pow(1 + i, -months)) / i);
    let lo = -0.5, hi = 1;
    if (pv(hi) > borrowed) return hi;
    if (pv(lo) < borrowed) return lo;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (pv(mid) > borrowed) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /* Easy payment / instalment plan / lease. Fees are treated as paid up front. */
  function installment({ cashPrice, monthly, months, down = 0, fees = 0 }) {
    const total = down + fees + monthly * months;
    const extra = total - cashPrice;
    const loan = cashPrice - down;            // what the plan says you borrow
    const received = loan - fees;             // what you really get once fees are taken
    let monthlyRate = null, apr = null, effective = null, flat = null;
    if (received > 0 && monthly > 0 && months >= 1) {
      monthlyRate = solveMonthlyRate(received, monthly, months);
      apr = monthlyRate * 12;
      effective = Math.pow(1 + monthlyRate, 12) - 1;
    }
    // Flat rate, the way plans are usually advertised: interest on the full loan for the whole term, fees left out.
    if (loan > 0 && months >= 1) flat = (monthly * months - loan) / loan / (months / 12);
    return { total, extra, loan, received, monthlyRate, apr, effective, flat };
  }

  /* Months of saving `monthly` (at annualRate) before you could pay `target` in cash. */
  function monthsToSave(target, monthly, annualRate, limit = 600) {
    if (!(monthly > 0) || !(target > 0)) return null;
    const i = Math.pow(1 + annualRate, 1 / 12) - 1;
    let balance = 0;
    for (let n = 1; n <= limit; n++) {
      balance = balance * (1 + i) + monthly;
      if (balance >= target) return n;
    }
    return null;
  }

  function verdictOnce(minutesPerUse, net) {
    if (net <= 0) return { level: 'good', emoji: '💎', title: 'Holds its value' };
    if (minutesPerUse == null) return { level: 'bad', emoji: '🫥', title: 'No uses planned' };
    if (minutesPerUse <= 5) return { level: 'good', emoji: '✅', title: 'Obviously worth it' };
    if (minutesPerUse <= 20) return { level: 'good', emoji: '👍', title: 'Worth it' };
    if (minutesPerUse <= 60) return { level: 'warn', emoji: '🤔', title: 'Think it over' };
    return { level: 'bad', emoji: '😬', title: 'Pricey for each use' };
  }

  function verdictHabit(shareOfSalary) {
    if (shareOfSalary == null) return { level: 'ok', emoji: '🧾', title: 'Add your salary' };
    if (shareOfSalary <= 0.02) return { level: 'good', emoji: '☕', title: 'A small treat' };
    if (shareOfSalary <= 0.05) return { level: 'ok', emoji: '🙂', title: 'Noticeable' };
    if (shareOfSalary <= 0.10) return { level: 'warn', emoji: '🤔', title: 'A big habit' };
    return { level: 'bad', emoji: '😬', title: 'Major spending' };
  }

  function verdictInstallment(plan, investRate) {
    if (plan.extra <= 0.5) return { level: 'good', emoji: '🎉', title: 'Truly interest-free' };
    if (plan.apr == null) return { level: 'bad', emoji: '🚩', title: 'Check the numbers' };
    if (plan.apr <= investRate + 0.02) return { level: 'ok', emoji: '🙂', title: 'Cheap credit' };
    if (plan.apr <= 0.20) return { level: 'warn', emoji: '🤔', title: 'Costs like a loan' };
    return { level: 'bad', emoji: '🚩', title: 'Expensive credit' };
  }

  const trim = (x, d) => String(Number(x.toFixed(d)));

  /* Rs. 150,000 — or, with lakhs on, Rs. 1.5 lakhs. */
  function formatRs(n, opts) {
    if (n == null || !isFinite(n)) return '—';
    const a = Math.abs(n);
    let body;
    if (opts && opts.lakhs && a >= 1e5) {
      if (a >= 1e7) body = trim(a / 1e6, 2) + ' million';
      else { const l = Number((a / 1e5).toFixed(2)); body = l + (l === 1 ? ' lakh' : ' lakhs'); }
    } else {
      body = a.toLocaleString('en-US', { maximumFractionDigits: a < 100 ? 2 : 0 });
    }
    return (n < 0 && Math.round(a * 100) > 0 ? '−' : '') + 'Rs. ' + body;
  }

  /* For inputs: 150000 → "150,000". */
  function formatPlain(n) {
    if (n == null || !isFinite(n)) return '';
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  const api = {
    PER_YEAR, parseAmount, hourlyRate, futureValue, futureValueMonthly, inTodaysMoney, realRate,
    oneOff, habit, installment, solveMonthlyRate, monthsToSave,
    verdictOnce, verdictHabit, verdictInstallment, formatRs, formatPlain,
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.WorthCalc = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
