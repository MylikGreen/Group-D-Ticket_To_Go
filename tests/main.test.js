// Unit tests for the shared helpers in js/main.js
// (saveData, loadData, loadDecks, saveDecks, makeId, toggleDarkMode, updateThemeButtons)
// Run with: npm test

const { JSDOM } = require("jsdom");
const { describe, test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const code = fs.readFileSync(path.join(__dirname, "..", "js", "main.js"), "utf8");

// Values made inside the jsdom window are from another realm, so copy them to plain values
const plain = (value) => JSON.parse(JSON.stringify(value));

// Build a fresh page and run main.js in it, like a browser loading the <script>
function loadPage() {
  const dom = new JSDOM(
    `<!DOCTYPE html>
    <html>
      <body>
        <nav><a href="index.html">Home</a><a href="pages/decks.html">Decks</a></nav>
        <button class="theme-toggle" aria-pressed="false">
          <span class="theme-toggle-icon"></span>
        </button>
        <button class="theme-toggle" aria-pressed="false"></button>
      </body>
    </html>`,
    { url: "https://example.com/pages/decks.html", runScripts: "outside-only" },
  );
  // A top-level const is private to the eval, so expose DECKS_KEY for the test
  dom.window.eval(code + "\nwindow.DECKS_KEY_FOR_TEST = DECKS_KEY;");
  return dom;
}

// Fire DOMContentLoaded so the page-setup listeners in main.js run
function fireReady(dom) {
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));
}

describe("saveData() and loadData()", () => {
  let dom;
  beforeEach(() => {
    dom = loadPage();
  });

  test("loadData returns an empty array when nothing is saved", () => {
    assert.deepEqual(plain(dom.window.eval("loadData('missing')")), []);
  });

  test("saveData stores the value as JSON in localStorage", () => {
    dom.window.eval("saveData('k', { a: 1, list: [1, 2] })");
    assert.equal(dom.window.localStorage.getItem("k"), '{"a":1,"list":[1,2]}');
  });

  test("loadData gives back what saveData stored", () => {
    dom.window.eval("saveData('k', [{ id: 'x', name: 'Bio' }])");
    assert.deepEqual(plain(dom.window.eval("loadData('k')")), [{ id: "x", name: "Bio" }]);
  });

  test("loadData throws on corrupt JSON (loadDecks is what guards this)", () => {
    dom.window.localStorage.setItem("bad", "{not json");
    assert.throws(() => dom.window.eval("loadData('bad')"), { name: "SyntaxError" });
  });
});

describe("loadDecks() and saveDecks()", () => {
  let dom;
  beforeEach(() => {
    dom = loadPage();
  });

  test("uses the 'decks' storage key", () => {
    assert.equal(dom.window.DECKS_KEY_FOR_TEST, "decks");
  });

  test("returns [] when no decks have been saved", () => {
    assert.deepEqual(plain(dom.window.eval("loadDecks()")), []);
  });

  test("saveDecks then loadDecks round-trips decks and cards", () => {
    const decks = [
      {
        id: "d1",
        name: "Math",
        cards: [{ id: "c1", front: "2+2", back: "4", status: "new" }],
      },
    ];
    dom.window.eval(`saveDecks(${JSON.stringify(decks)})`);
    assert.deepEqual(plain(dom.window.eval("loadDecks()")), decks);
    assert.deepEqual(JSON.parse(dom.window.localStorage.getItem("decks")), decks);
  });

  test("returns [] instead of crashing when saved data is corrupt JSON", () => {
    dom.window.localStorage.setItem("decks", "{oops");
    assert.deepEqual(plain(dom.window.eval("loadDecks()")), []);
  });

  test("returns [] when saved data is valid JSON but not an array", () => {
    dom.window.localStorage.setItem("decks", '{"id":"d1"}');
    assert.deepEqual(plain(dom.window.eval("loadDecks()")), []);
  });
});

describe("makeId()", () => {
  const dom = loadPage();

  test("returns a non-empty lowercase alphanumeric string", () => {
    const id = dom.window.eval("makeId()");
    assert.equal(typeof id, "string");
    assert.match(id, /^[a-z0-9]{6,}$/);
  });

  test("gives different ids on repeated calls", () => {
    const ids = new Set(Array.from({ length: 500 }, () => dom.window.eval("makeId()")));
    assert.equal(ids.size, 500);
  });
});

describe("Dark mode", () => {
  let dom;
  let document;
  beforeEach(() => {
    dom = loadPage();
    document = dom.window.document;
  });

  test("toggleDarkMode turns dark mode on and remembers it", () => {
    dom.window.eval("toggleDarkMode()");
    assert.ok(document.body.classList.contains("dark-mode"));
    assert.equal(dom.window.localStorage.getItem("darkMode"), "true");
  });

  test("toggleDarkMode a second time turns it back off", () => {
    dom.window.eval("toggleDarkMode()");
    dom.window.eval("toggleDarkMode()");
    assert.ok(!document.body.classList.contains("dark-mode"));
    assert.equal(dom.window.localStorage.getItem("darkMode"), "false");
  });

  test("updates aria-pressed on every theme button", () => {
    dom.window.eval("toggleDarkMode()");
    const pressed = [...document.querySelectorAll(".theme-toggle")].map((b) =>
      b.getAttribute("aria-pressed"),
    );
    assert.deepEqual(pressed, ["true", "true"]);
  });

  test("swaps the icon between sun and moon, and skips buttons without one", () => {
    const icon = document.querySelector(".theme-toggle-icon");
    dom.window.eval("toggleDarkMode()");
    assert.equal(icon.textContent, "🌙");
    dom.window.eval("toggleDarkMode()");
    assert.equal(icon.textContent, "☀️");
  });

  test("restores dark mode on page load when it was saved", () => {
    dom.window.localStorage.setItem("darkMode", "true");
    fireReady(dom);
    assert.ok(document.body.classList.contains("dark-mode"));
    assert.equal(document.querySelector(".theme-toggle").getAttribute("aria-pressed"), "true");
  });

  test("stays in light mode on page load when nothing was saved", () => {
    fireReady(dom);
    assert.ok(!document.body.classList.contains("dark-mode"));
    assert.equal(document.querySelector(".theme-toggle").getAttribute("aria-pressed"), "false");
  });
});
