import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../../netlify/functions/api.js';
import { hashPasswordClient, requestApiJson } from '../../src/services/auth/authService.js';

test('Netlify Function API: returns 400 JSON when registration fields are missing', async () => {
  const event = {
    httpMethod: 'POST',
    path: '/api/auth/register',
    headers: { 'client-ip': '127.0.0.1' },
    body: JSON.stringify({ email: '', password: '' }),
  };

  const response = await handler(event, {});
  assert.equal(response.statusCode, 400);
  assert.equal(response.headers['Content-Type'], 'application/json');

  const body = JSON.parse(response.body);
  assert.ok(body.error.includes('required'));
});

test('Netlify Function API: enforces password minimum length of 6 characters', async () => {
  const event = {
    httpMethod: 'POST',
    path: '/api/auth/register',
    headers: { 'client-ip': '127.0.0.2' },
    body: JSON.stringify({ email: 'short@test.com', name: 'Short', password: '123' }),
  };

  const response = await handler(event, {});
  assert.equal(response.statusCode, 400);

  const body = JSON.parse(response.body);
  assert.ok(body.error.includes('6 characters'));
});

test('Netlify Function API: successfully registers a new user with 201 Created and signed token', async () => {
  const testEmail = `user-${Date.now()}@hpstools.com`;
  const event = {
    httpMethod: 'POST',
    path: '/api/auth/register',
    headers: { 'client-ip': '127.0.0.3' },
    body: JSON.stringify({ email: testEmail, name: 'Harshit Tester', password: 'Password123!' }),
  };

  const response = await handler(event, {});
  assert.equal(response.statusCode, 201);
  assert.equal(response.headers['Content-Type'], 'application/json');

  const body = JSON.parse(response.body);
  assert.ok(body.token && body.token.length > 20);
  assert.equal(body.user.email, testEmail);
  assert.equal(body.user.role, 'user');
  assert.equal(body.user.passwordHash, undefined, 'Password hash must never be returned to client');
  assert.equal(body.user.password, undefined, 'Plain password must never be returned to client');

  // Attempt duplicate registration -> must return 409 Conflict
  const dupResponse = await handler(event, {});
  assert.equal(dupResponse.statusCode, 409);
  const dupBody = JSON.parse(dupResponse.body);
  assert.ok(dupBody.error.includes('already exists'));
});

test('Netlify Function API: authenticates registered user and rejects bad passwords', async () => {
  const testEmail = `login-${Date.now()}@hpstools.com`;
  // 1. Register
  await handler({
    httpMethod: 'POST',
    path: '/api/auth/register',
    headers: { 'client-ip': '127.0.0.4' },
    body: JSON.stringify({ email: testEmail, name: 'Login User', password: 'ValidPassword2026' }),
  }, {});

  // 2. Bad password login
  const badLogin = await handler({
    httpMethod: 'POST',
    path: '/api/auth/login',
    headers: { 'client-ip': '127.0.0.4' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' }),
  }, {});
  assert.equal(badLogin.statusCode, 401);

  // 3. Good password login
  const goodLogin = await handler({
    httpMethod: 'POST',
    path: '/api/auth/login',
    headers: { 'client-ip': '127.0.0.4' },
    body: JSON.stringify({ email: testEmail, password: 'ValidPassword2026' }),
  }, {});
  assert.equal(goodLogin.statusCode, 200);
  const goodBody = JSON.parse(goodLogin.body);
  assert.ok(goodBody.token);
  assert.equal(goodBody.user.email, testEmail);
});

test('Safe Request Handler: detects HTML documents without throwing SyntaxError on <!DOCTYPE', async () => {
  // Mock global fetch returning HTML
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    return {
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'text/html; charset=UTF-8' : null),
      },
      text: async () => '<!DOCTYPE html><html><head><title>HPS Tools</title></head><body>SPA Root</body></html>',
    } as any;
  }) as any;

  try {
    const res = await requestApiJson('/api/auth/register', { method: 'POST' });
    assert.equal(res.ok, false);
    assert.equal(res.isHtml, true);
    assert.ok(res.error?.includes('HTML'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Client Cryptographic Hashing: produces consistent SHA-256 hexadecimal digests', async () => {
  const hash1 = await hashPasswordClient('SecurePass123!');
  const hash2 = await hashPasswordClient('SecurePass123!');
  const hashDifferent = await hashPasswordClient('OtherPass456!');

  assert.equal(hash1, hash2, 'Identical passwords must produce identical hashes');
  assert.notEqual(hash1, hashDifferent, 'Different passwords must produce different hashes');
  assert.equal(hash1.length, 64, 'SHA-256 hex digest must be 64 characters long');
});
