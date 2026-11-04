// Run with: node --test worth-it/test/calc.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../calc.js');

const close = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test('parseAmount reads Sri Lankan ways of writing money', () => {
  assert.equal(C.parseAmount('150,000'), 150000);
  assert.equal(C.parseAmount('Rs. 150000'), 150000);
  assert.equal(C.parseAmount('1.5 lakhs'), 150000);
  assert.equal(C.parseAmount('1.5L'), 150000);
  assert.equal(C.parseAmount('2mn'), 2000000);
  assert.equal(C.parseAmount('25k'), 25000);
  assert.ok(Number.isNaN(C.parseAmount('')));
  assert.ok(Number.isNaN(C.parseAmount('abc')));
  assert.ok(Number.isNaN(C.parseAmount('5 apples')));
});

test('hourly rate from monthly salary', () => {
  close(C.hourlyRate(120000, 45), 120000 * 12 / (45 * 52));
  assert.ok(Number.isNaN(C.hourlyRate(0, 45)));
});

test('one-off purchase: phone example', () => {
  const r = C.oneOff({ price: 150000, resale: 40000, uses: 1, per: 'day', years: 3, hourly: 1000, targetMinutes: 20 });
  assert.equal(r.totalUses, 1095);
  close(r.costPerUse, 110000 / 1095);
  assert.equal(r.hoursOfWork, 150);
  close(r.targetCost, 1000 / 3);
  assert.equal(r.usesForTarget, Math.ceil(110000 / (1000 / 3)));
});

test('one-off purchase that holds its value', () => {
  const r = C.oneOff({ price: 100, resale: 120, uses: 1, per: 'week', years: 1, hourly: 1000 });
  assert.equal(r.costPerUse, 0);
  assert.equal(C.verdictOnce(r.minutesPerUse, r.net).title, 'Holds its value');
});

test('future value of a lump sum and of monthly saving', () => {
  close(C.futureValue(150000, 0.08, 10), 323838.75, 0.5);
  close(C.futureValueMonthly(1000, 0, 2), 24000);
  // Monthly compounding at an 8% effective annual rate: a little under paying 12,000 once a year at 8%.
  const fv = C.futureValueMonthly(1000, 0.08, 10);
  assert.ok(fv > 12000 * 14.48 && fv < 12000 * 15.1, String(fv));
});

test('real rate after inflation', () => {
  close(C.realRate(0.10, 0.12), 1.10 / 1.12 - 1, 1e-9);
  assert.ok(C.realRate(0.10, 0.12) < 0);
});

test('installment plan: true rate is higher than flat rate', () => {
  const p = C.installment({ cashPrice: 250000, monthly: 23500, months: 12 });
  assert.equal(p.total, 282000);
  assert.equal(p.extra, 32000);
  close(p.flat, 0.128, 1e-9);
  // Present value of the payments at the solved rate equals the amount borrowed.
  const i = p.monthlyRate;
  close(23500 * (1 - Math.pow(1 + i, -12)) / i, 250000, 0.01);
  assert.ok(p.apr > 0.22 && p.apr < 0.24, String(p.apr));
});

test('installment plan with no extra cost is interest-free', () => {
  const p = C.installment({ cashPrice: 120000, monthly: 10000, months: 12 });
  close(p.apr, 0, 1e-6);
  assert.equal(C.verdictInstallment(p, 0.08).title, 'Truly interest-free');
});

test('fees make a 0% plan cost something', () => {
  const p = C.installment({ cashPrice: 120000, monthly: 10000, months: 12, fees: 4800 });
  assert.equal(p.extra, 4800);
  assert.ok(p.apr > 0.07, String(p.apr));
});

test('months to save up', () => {
  assert.equal(C.monthsToSave(12000, 1000, 0), 12);
  assert.ok(C.monthsToSave(250000, 23500, 0.08) <= 11);
  assert.equal(C.monthsToSave(1e9, 1, 0), null);
});

test('formatRs in commas and in lakhs', () => {
  assert.equal(C.formatRs(150000), 'Rs. 150,000');
  assert.equal(C.formatRs(150000, { lakhs: true }), 'Rs. 1.5 lakhs');
  assert.equal(C.formatRs(100000, { lakhs: true }), 'Rs. 1 lakh');
  assert.equal(C.formatRs(25000000, { lakhs: true }), 'Rs. 25 million');
  assert.equal(C.formatRs(12.5), 'Rs. 12.5');
  assert.equal(C.formatRs(-500), '−Rs. 500');
});
