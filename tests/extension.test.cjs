'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright-core');
const extension = path.resolve(__dirname, '../HTB-Context-Translator');
let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox'] }); });
after(async () => { await browser?.close(); });

async function pageWithCourse(html = '<p>The server receives an HTTP request.</p>') {
  const page = await browser.newPage();
  page.setDefaultTimeout(3000);
  await page.route('https://academy.hackthebox.com/**', route => route.fulfill({ contentType: 'text/html', body: `<html lang="en"><head></head><body><article>${html}</article></body></html>` }));
  await page.goto('https://academy.hackthebox.com/module/1/section/1');
  await page.evaluate(() => {
    window.requests = []; window.listeners = []; window.auto = true; window.pending = [];
    window.chrome = {
      runtime: { id: 'test', onMessage: { addListener: fn => listeners.push(fn) }, sendMessage: async request => {
        if (request.action === 'get_settings') return { success: true, autoTranslate: auto, hasKey: true, glossary: '' };
        if (request.action === 'translate_batch') {
          requests.push(request);
          if (window.fail) return { success: false, error: 'Cota esgotada' };
          if (window.delay) await new Promise(resolve => pending.push(resolve));
          return { success: true, results: request.items.map(i => ({ id: i.id, translatedText: `PT: ${i.text}` })) };
        }
        return { success: true };
      } },
      storage: { local: { get: (keys, cb) => { const data = { htbAutoTranslate: true }; if (cb) cb(data); return Promise.resolve(data); }, set: async () => {} } }
    };
    window.deliver = request => listeners.forEach(fn => fn(request, { id: 'test' }, () => {}));
  });
  const guard = path.join(extension, 'translation-guard.js');
  if (fs.existsSync(guard)) await page.addScriptTag({ path: guard });
  return page;
}
async function start(page) { await page.addScriptTag({ path: path.join(extension, 'content.js') }); }
async function translated(page, selector = 'article p') { await page.waitForFunction(s => document.querySelector(s)?.textContent.startsWith('PT:'), selector); }

test('initializes and automatically translates a real Academy section route', async () => {
  const page = await pageWithCourse();
  try { await start(page); await translated(page); assert.equal(await page.locator('#htb-translator-widget').count(), 1); }
  finally { await page.close(); }
});

test('preserves code, inline nodes, listeners and original toggle; never translates twice', async () => {
  const page = await pageWithCourse('<p>Read <a href="#" id="link">the guide</a> with <code>nmap -sV</code>.</p><pre>curl /etc/passwd</pre>');
  try {
    await page.evaluate(() => { window.link = document.querySelector('#link'); link.onclick = () => window.clicked = true; });
    await start(page); await translated(page);
    assert.equal(await page.locator('code').textContent(), 'nmap -sV');
    assert.equal(await page.locator('pre').textContent(), 'curl /etc/passwd');
    assert.equal(await page.evaluate(() => link === document.querySelector('#link')), true);
    await page.locator('#link').click(); assert.equal(await page.evaluate(() => clicked), true);
    await page.locator('#htb-btn-toggle').click();
    assert.equal(await page.locator('article p').textContent(), 'Read the guide with nmap -sV.');
    const count = await page.evaluate(() => requests.length);
    await page.waitForTimeout(1100);
    assert.equal(await page.evaluate(() => requests.length), count);
    await page.locator('#htb-btn-toggle').click(); await translated(page);
    assert.equal(await page.evaluate(() => requests.length), count);
  } finally { await page.close(); }
});

test('ignores delayed responses after navigation and translates newly inserted text on the same URL', async () => {
  const page = await pageWithCourse();
  try {
    await page.evaluate(() => window.delay = true); await start(page);
    await page.waitForFunction(() => requests.length === 1);
    await page.evaluate(() => {
      history.pushState({}, '', '/module/1/section/2');
      document.querySelector('article p').textContent = 'A different lesson.';
      window.delay = false; pending.splice(0).forEach(resolve => resolve());
    });
    await page.waitForFunction(() => document.querySelector('article p').textContent === 'PT: A different lesson.');
    await page.evaluate(() => { const p = document.createElement('p'); p.id = 'late'; p.textContent = 'Late lesson content.'; document.querySelector('article').append(p); });
    await translated(page, '#late');
    assert.equal(await page.locator('article p').first().textContent(), 'PT: A different lesson.');
  } finally { await page.close(); }
});

test('cache distinguishes paragraphs and sections and survives back navigation', async () => {
  const page = await pageWithCourse('<p>First paragraph.</p><p>Second paragraph.</p>');
  try {
    await start(page); await translated(page); const count = await page.evaluate(() => requests.length);
    await page.evaluate(() => { history.pushState({}, '', '/module/1/section/2'); document.querySelector('article').innerHTML = '<p>Another section.</p>'; });
    await translated(page);
    await page.evaluate(() => { history.back(); });
    await page.waitForFunction(() => location.pathname.endsWith('/section/1'));
    await page.evaluate(() => { document.querySelector('article').innerHTML = '<p>First paragraph.</p><p>Second paragraph.</p>'; });
    await translated(page);
    assert.deepEqual(await page.locator('article p').allTextContents(), ['PT: First paragraph.', 'PT: Second paragraph.']);
    assert.equal(await page.evaluate(() => requests.length), count + 1);
    await page.locator('#htb-btn-toggle').click();
    assert.deepEqual(await page.locator('article p').allTextContents(), ['First paragraph.', 'Second paragraph.']);
  } finally { await page.close(); }
});

test('API error remains visible without retry storm and new key resumes translation', async () => {
  const page = await pageWithCourse();
  try {
    await page.evaluate(() => window.fail = true); await start(page);
    await page.waitForFunction(() => document.querySelector('#htb-status-badge')?.textContent.includes('Cota'));
    await page.waitForTimeout(1200); assert.equal(await page.evaluate(() => requests.length), 1);
    await page.evaluate(() => { window.fail = false; deliver({ action: 'api_key_updated', autoTranslate: true }); });
    await translated(page);
  } finally { await page.close(); }
});

function worker(fetchReply, saved = {}) {
  let handler; const calls = [];
  const context = vm.createContext({ console, URL, AbortController, setTimeout, clearTimeout,
    importScripts: () => {}, fetch: async (url, options) => {
      if (url.endsWith('models.json')) return { json: async () => ['gemini-3.5-flash-lite', 'gemini-3.5-flash'] };
      calls.push({ url, options }); return fetchReply(url, options);
    }, chrome: {
      runtime: { id: 'test', getURL: p => `chrome-extension://test/${p}`, onMessage: { addListener: fn => handler = fn }, onInstalled: { addListener() {} } },
      storage: { local: { setAccessLevel: async () => {}, get: async () => saved, set: async v => Object.assign(saved, v) } },
      tabs: { query: async () => [], sendMessage: async () => {} },
      contextMenus: { onClicked: { addListener() {} } }
    }
  });
  vm.runInContext(fs.readFileSync(path.join(extension, 'background.js'), 'utf8'), context);
  return { calls, context, send: (request, popup = false) => new Promise(resolve => {
    const sender = popup ? { id: 'test', url: 'chrome-extension://test/popup.html' } : { id: 'test', tab: { id: 1 }, frameId: 0, url: 'https://academy.hackthebox.com/module/1/section/1' };
    if (!handler(request, sender, resolve)) resolve(null);
  }) };
}
const response = translations => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ translations }) }] } }] }) });
test('rejects malformed AI results and does not retry quota failures', async () => {
  const a = worker(async () => response([{ id: 9, translatedText: 'errado' }]), { geminiApiKey: 'test-key-not-a-real-credential' });
  assert.equal((await a.send({ action: 'translate_batch', items: [{ id: 0, text: 'Hello' }] })).success, false);
  const b = worker(async () => ({ ok: false, status: 429, json: async () => ({ error: { message: 'quota' } }) }), { geminiApiKey: 'test-key-not-a-real-credential' });
  assert.equal((await b.send({ action: 'translate_batch', items: [{ id: 0, text: 'Hello' }] })).success, false);
  assert.equal(b.calls.length, 1);
});
test('new popup key takes effect, settings hide secrets and course cannot change key', async () => {
  const a = worker(async () => response([{ id: 0, translatedText: 'Olá' }]), { geminiApiKey: 'old-test-credential-value' });
  assert.equal((await a.send({ action: 'save_api_key', key: 'new-test-credential-value' })).success, false);
  assert.equal((await a.send({ action: 'save_api_key', key: 'new-test-credential-value' }, true)).success, true);
  const settings = await a.send({ action: 'get_settings' });
  assert.equal(JSON.stringify(settings).includes('credential-value'), false);
  await a.send({ action: 'translate_batch', items: [{ id: 0, text: 'Hello' }] });
  assert.equal(a.calls[0].options.headers['x-goog-api-key'], 'new-test-credential-value');
  assert.equal(a.calls[0].url.includes('key='), false);
});
