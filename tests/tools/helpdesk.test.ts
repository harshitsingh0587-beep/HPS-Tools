import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Help Desk Knowledge Base: verify component and guide specifications', () => {
  const filePath = path.resolve('src/components/ai/HelpDeskKnowledgeBase.tsx');
  assert.ok(fs.existsSync(filePath), 'HelpDeskKnowledgeBase.tsx should exist');

  const content = fs.readFileSync(filePath, 'utf-8');

  // Verify key required guides are present
  assert.ok(content.includes('pdf-to-image'), 'Should contain PDF-to-image guide');
  assert.ok(content.includes('passport-photo-maker'), 'Should contain passport-photo-maker guide');
  assert.ok(content.includes('loan-calculator'), 'Should contain loan-calculator guide');
  assert.ok(content.includes('image-resizer'), 'Should contain image-resizer guide');
  assert.ok(content.includes('password-generator'), 'Should contain password-generator guide');
  assert.ok(content.includes('dob-calculator'), 'Should contain dob-calculator guide');

  // Verify step-by-step structure
  assert.ok(content.includes('Step-by-Step Walkthrough'), 'Should contain Step-by-Step section');
  assert.ok(content.includes('Pro Recommendations'), 'Should contain pro tips');
  assert.ok(content.includes('Common Mistakes to Avoid'), 'Should contain common mistakes');
  assert.ok(content.includes('Fulfill with AI Assistant'), 'Should contain direct AI fulfillment action');
});
