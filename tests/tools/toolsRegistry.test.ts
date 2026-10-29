import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS_REGISTRY, TOOL_CATEGORIES } from '../../src/constants/toolsRegistry.ts';

test('Tools Registry: contains exactly 21 tools with valid paths and descriptions', () => {
  assert.equal(TOOLS_REGISTRY.length, 21);

  for (const tool of TOOLS_REGISTRY) {
    assert.ok(tool.id, 'Tool has an ID');
    assert.ok(tool.name, `Tool ${tool.id} has a name`);
    assert.ok(tool.description, `Tool ${tool.id} has a description`);
    assert.ok(tool.path.startsWith('/tools/'), `Tool ${tool.id} path starts with /tools/`);
    assert.ok(TOOL_CATEGORIES.includes(tool.category), `Tool ${tool.id} category is registered`);
  }
});
