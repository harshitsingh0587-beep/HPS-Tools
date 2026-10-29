import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from '../../src/utils/calculator.ts';

test('Calculator Logic: handles standard arithmetic, operator precedence, and parentheses', () => {
  assert.equal(evaluateExpression('2 + 3 * 4').result, 14);
  assert.equal(evaluateExpression('(2 + 3) * 4').result, 20);
  assert.equal(evaluateExpression('10 - 20 / 4').result, 5);
  assert.equal(evaluateExpression('50 % 200').result, 100); // 50% of 200
});

test('Calculator Logic: handles division by zero safely', () => {
  const res = evaluateExpression('10 / 0');
  assert.equal(res.error, 'Cannot divide by zero');
});

test('Calculator Logic: handles empty or invalid expression', () => {
  assert.equal(evaluateExpression('').result, 0);
  assert.ok(evaluateExpression('2 ++ 3').error);
});
