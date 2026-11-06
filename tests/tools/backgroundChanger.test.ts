import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hexToRgb,
  PRESET_BACKGROUND_COLORS,
} from '../../src/services/image/backgroundRemovalService.ts';

test('Background Colour Service: hexToRgb converts valid and shorthand colors', () => {
  assert.deepEqual(hexToRgb('#FFFFFF'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(hexToRgb('#000000'), { r: 0, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('#142B50'), { r: 20, g: 43, b: 80 }); // HPS Navy
  assert.deepEqual(hexToRgb('#FFF'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(hexToRgb('transparent'), { r: 0, g: 0, b: 0 });
});

test('Background Colour Service: preset colors are properly defined', () => {
  assert.ok(PRESET_BACKGROUND_COLORS.length >= 10);
  const white = PRESET_BACKGROUND_COLORS.find((c) => c.id === 'white');
  const transparent = PRESET_BACKGROUND_COLORS.find((c) => c.id === 'transparent');
  const navy = PRESET_BACKGROUND_COLORS.find((c) => c.id === 'navy');

  assert.ok(white, 'White preset exists');
  assert.ok(transparent?.isTransparent, 'Transparent preset exists');
  assert.equal(navy?.value, '#142B50', 'HPS Navy preset matches brand color');
});
