import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLoan } from '../../src/utils/loan.ts';

test('Loan Calculator: standard 30-year fixed loan calculation', () => {
  const res = calculateLoan({
    loanAmount: 100000,
    annualInterestRate: 6,
    loanDurationMonths: 360,
  });
  // Monthly payment for $100k @ 6% for 30 years is ~$599.55
  assert.ok(Math.abs(res.monthlyPayment - 599.55) < 0.5);
  assert.equal(res.isZeroInterest, false);
  assert.ok(res.totalInterest > 100000);
  assert.equal(res.amortizationSchedule.length, 360);
});

test('Loan Calculator: zero interest scenario', () => {
  const zeroInt = calculateLoan({
    loanAmount: 12000,
    annualInterestRate: 0,
    loanDurationMonths: 12,
  });
  assert.equal(zeroInt.monthlyPayment, 1000);
  assert.equal(zeroInt.totalInterest, 0);
  assert.equal(zeroInt.isZeroInterest, true);
});
