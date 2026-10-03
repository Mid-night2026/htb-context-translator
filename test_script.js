const content = require('fs').readFileSync('content.js', 'utf-8');
const vm = require('vm');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div class="module-content">
      <article>
        <h1>Welcome</h1>
        <p>This is a test.</p>
        <p>Some more text.</p>
      </article>
    </div>
  </body>
  </html>
`);

const window = dom.window;
const document = window.document;

// Mock chrome API
const chrome = {
  storage: {
    local: {
      get: (keys, cb) => cb({ htbAutoTranslate: true }),
      set: (obj) => {}
    }
  },
  runtime: {
    onMessage: { addListener: () => {} },
    sendMessage: (msg, cb) => {
      // simulate background script response
      console.log('Sending message:', msg);
      cb({
        success: true,
        results: msg.items.map((item, idx) => ({ id: item.id, translatedText: `Translated ${idx}` }))
      });
    }
  }
};

const context = vm.createContext({
  window: window,
  document: document,
  location: window.location,
  history: window.history,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  MutationObserver: window.MutationObserver,
  Event: window.Event,
  chrome: chrome,
  console: console
});

vm.runInContext(content, context);
console.log('Script ran successfully');
