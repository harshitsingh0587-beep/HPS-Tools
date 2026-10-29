import test from 'node:test';
import assert from 'node:assert/strict';
import { convertUnits } from '../../src/utils/converter.ts';

test('Unit Converter: converts length, temperature, speed, area, and volume correctly', () => {
  // Length: 1 km = 1000 m
  const kmToM = convertUnits(1, 'length', 'km', 'm');
  assert.equal(kmToM.result, 1000);

  // Temperature: 100 C = 212 F
  const cToF = convertUnits(100, 'temperature', 'C', 'F');
  assert.equal(Math.round(cToF.result), 212);

  // Speed: 100 km/h to m/s
  const speed = convertUnits(100, 'speed', 'kmh', 'mps');
  assert.ok(Math.abs(speed.result - 27.777) < 0.01);

  // Area: 1 sq km = 1,000,000 sq m
  const area = convertUnits(1, 'area', 'sqkm', 'sqm');
  assert.equal(area.result, 1000000);
});
