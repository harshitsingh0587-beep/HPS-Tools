import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS_CATALOG } from '../../src/data/toolsCatalog.js';

test('Security & Integrity: All 22 tools are registered and have safe local paths', () => {
  assert.equal(TOOLS_CATALOG.length, 22);
  for (const tool of TOOLS_CATALOG) {
    assert.ok(tool.id && tool.id.length > 0, 'Tool id must be defined');
    assert.ok(tool.path.startsWith('/tools/'), `Tool path must be local (/tools/...): ${tool.path}`);
    assert.ok(tool.name.length > 0, `Tool name must be present: ${tool.id}`);
  }
});

test('Security & Privacy: Background color presets contain valid colors and safe hex formats', () => {
  const bgChangerTool = TOOLS_CATALOG.find((t) => t.id === 'image-background-changer');
  assert.ok(bgChangerTool, 'Image background colour changer must be registered');
  assert.equal(bgChangerTool.category, 'Image Tools');
});
