import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword, evaluatePasswordStrength } from '../../src/utils/password.ts';

test('Password Generator: length and character constraint validation', () => {
  const result = generatePassword({
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: true,
  });

  assert.equal(result.password.length, 20);
  assert.ok(/[A-Z]/.test(result.password));
  assert.ok(/[a-z]/.test(result.password));
  assert.ok(/[0-9]/.test(result.password));
  assert.ok(/[^a-zA-Z0-9]/.test(result.password));

  const strength = evaluatePasswordStrength(result.password);
  assert.ok(strength.score >= 4);
});
