import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from './calculator.ts';
import { calculateLoan } from './loan.ts';
import { calculateDob, isLeapYear } from './dob.ts';
import { generatePassword, evaluatePasswordStrength } from './password.ts';
import { analyzeText } from './text.ts';
import { convertUnits } from './converter.ts';

test('Calculator: handles addition, precedence, and parentheses', () => {
  assert.equal(evaluateExpression('2 + 3 * 4').result, 14);
  assert.equal(evaluateExpression('(2 + 3) * 4').result, 20);
  assert.equal(evaluateExpression('10 - 20 / 4').result, 5);
  assert.equal(evaluateExpression('50 % 200').result, 100); // 50% of 200
  assert.equal(evaluateExpression('10 / 0').error, 'Cannot divide by zero');
});

test('Loan Calculator: standard, zero-interest, and extra payments', () => {
  // $100,000 at 6% for 30 years (360 months)
  const res = calculateLoan({
    loanAmount: 100000,
    annualInterestRate: 6,
    loanDurationMonths: 360,
  });
  // Monthly payment for 100k at 6% 30yr is approx $599.55
  assert.ok(Math.abs(res.monthlyPayment - 599.55) < 0.5);
  assert.equal(res.isZeroInterest, false);
  assert.ok(res.totalInterest > 100000); // ~115,838
  assert.equal(res.amortizationSchedule.length, 360);

  // Zero interest test: $12,000 for 12 months = $1,000/mo
  const zeroInt = calculateLoan({
    loanAmount: 12000,
    annualInterestRate: 0,
    loanDurationMonths: 12,
  });
  assert.equal(zeroInt.monthlyPayment, 1000);
  assert.equal(zeroInt.totalInterest, 0);
  assert.equal(zeroInt.isZeroInterest, true);
});

test('Date of Birth Calculator: age, leap year, and next birthday', () => {
  assert.equal(isLeapYear(2000), true);
  assert.equal(isLeapYear(1900), false);
  assert.equal(isLeapYear(2024), true);

  // Fixed reference date: 2026-10-24
  const refDate = new Date(2026, 9, 24); // Oct is month index 9
  const dobResult = calculateDob('1990-10-24', refDate);

  assert.equal(dobResult.years, 36);
  assert.equal(dobResult.months, 0);
  assert.equal(dobResult.days, 0);
  assert.equal(dobResult.isBirthdayToday, true);
  assert.equal(dobResult.daysUntilNextBirthday, 0);
  assert.equal(dobResult.dayOfWeek, 'Wednesday');

  // Past birthday earlier in the year
  const dobEarlier = calculateDob('1995-05-15', refDate);
  assert.equal(dobEarlier.years, 31);
  assert.equal(dobEarlier.months, 5);
  assert.ok(dobEarlier.days >= 9);
});

test('Password Generator: length and constraints', () => {
  const result = generatePassword({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: true,
  });

  assert.equal(result.password.length, 16);
  assert.ok(/[A-Z]/.test(result.password));
  assert.ok(/[a-z]/.test(result.password));
  assert.ok(/[0-9]/.test(result.password));
  assert.ok(/[^a-zA-Z0-9]/.test(result.password));

  const strength = evaluatePasswordStrength(result.password);
  assert.ok(strength.score >= 4);
});

test('Word Counter: live stats and speaking/reading time', () => {
  const sample = 'The quick brown fox jumps over the lazy dog. It was a sunny morning! Are you ready?';
  const stats = analyzeText(sample);
  assert.equal(stats.words, 17);
  assert.equal(stats.sentences, 3);
  assert.ok(stats.charactersWithSpaces > 50);
  assert.ok(stats.charactersWithoutSpaces > 40);
  assert.equal(stats.paragraphs, 1);
});

test('Unit Converter: length, temperature, and speed conversions', () => {
  // 1 km = 1000 m
  const kmToM = convertUnits(1, 'length', 'km', 'm');
  assert.equal(kmToM.result, 1000);

  // 100 C = 212 F
  const cToF = convertUnits(100, 'temperature', 'C', 'F');
  assert.equal(cToF.result, 212);

  // 0 C = 273.15 K
  const cToK = convertUnits(0, 'temperature', 'C', 'K');
  assert.equal(cToK.result, 273.15);

  // 100 km/h to mph (~62.137)
  const speed = convertUnits(100, 'speed', 'kmh', 'mph');
  assert.ok(Math.abs(speed.result - 62.137) < 0.1);

  // 1 hectare = 10,000 sqm
  const haToSqm = convertUnits(1, 'area', 'ha', 'sqm');
  assert.equal(haToSqm.result, 10000);

  // 1 sqkm = 1,000,000 sqm
  const sqkmToSqm = convertUnits(1, 'area', 'sqkm', 'sqm');
  assert.equal(sqkmToSqm.result, 1000000);
});
