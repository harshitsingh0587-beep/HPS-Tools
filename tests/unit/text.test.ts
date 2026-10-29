import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeText } from '../../src/utils/text.ts';

test('Word Counter: calculates live word, character, sentence, and paragraph counts', () => {
  const sample = 'The quick brown fox jumps over the lazy dog. It was a sunny morning! Are you ready?';
  const stats = analyzeText(sample);
  assert.equal(stats.words, 17);
  assert.equal(stats.sentences, 3);
  assert.ok(stats.charactersWithSpaces > 50);
  assert.ok(stats.charactersWithoutSpaces > 40);
  assert.equal(stats.paragraphs, 1);
  assert.ok(stats.readingTimeMinutes >= 0);
  assert.ok(stats.speakingTimeMinutes >= 0);
});
