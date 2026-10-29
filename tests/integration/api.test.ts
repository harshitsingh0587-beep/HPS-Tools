import test from 'node:test';
import assert from 'node:assert/strict';

test('App Structure Integrity: verifies all core service directories and modules exist', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const requiredDirectories = [
    'src/components/common',
    'src/components/layout',
    'src/components/navigation',
    'src/components/forms',
    'src/components/buttons',
    'src/components/dialogs',
    'src/pages/Home',
    'src/pages/About',
    'src/pages/PrivacyPolicy',
    'src/pages/NotFound',
    'src/tools/calculator',
    'src/tools/password-generator',
    'src/tools/word-counter',
    'src/tools/unit-converter',
    'src/tools/date-of-birth-calculator',
    'src/tools/loan-calculator',
    'src/tools/convert-all',
    'src/features/authentication',
    'src/features/admin',
    'src/features/feedback',
    'src/features/saved-tools',
    'src/features/search',
    'src/features/theme',
    'src/services/file-conversion',
    'src/services/storage',
    'src/services/authentication',
    'src/services/api',
    'src/constants',
    'src/hooks',
    'src/types',
    'src/utils',
  ];

  for (const dir of requiredDirectories) {
    const fullPath = path.resolve(process.cwd(), dir);
    assert.ok(fs.existsSync(fullPath), `Directory ${dir} exists`);
  }
});
