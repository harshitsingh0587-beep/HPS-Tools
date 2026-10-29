import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDob, isLeapYear } from '../../src/utils/dob.ts';

test('Date of Birth Calculator: leap year detection', () => {
  assert.equal(isLeapYear(2000), true);
  assert.equal(isLeapYear(1900), false);
  assert.equal(isLeapYear(2024), true);
});

test('Date of Birth Calculator: exact age and milestone calculation', () => {
  const refDate = new Date(2026, 9, 24); // Oct 24, 2026
  const dobResult = calculateDob('1990-10-24', refDate);

  assert.equal(dobResult.years, 36);
  assert.equal(dobResult.months, 0);
  assert.equal(dobResult.days, 0);
  assert.equal(dobResult.isBirthdayToday, true);
  assert.equal(dobResult.daysUntilNextBirthday, 0);
  assert.equal(dobResult.dayOfWeek, 'Wednesday');
});
