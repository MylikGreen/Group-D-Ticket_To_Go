
const { JSDOM } = require("jsdom");
const { describe, test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

describe("Mark Cards as Memorized", () => {
  let dom;
  let decks;
  let savedDecks;

  beforeEach(() => {
    decks = [{
      id: "deck1",
      name: "Test Deck",
      cards: [
        { id: "1", front: "Question 1", back: "Answer 1", status: "new" },
        { id: "2", front: "Question 2", back: "Answer 2", status: "new" },
        { id: "3", front: "Question 3", back: "Answer 3", status: "new" }
      ]
    }];

    savedDecks = null;

    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <div id="study-area"></div>
        <div id="study-empty"></div>
        <div id="study-picker"></div>
        <div id="study-decks"></div>
        <select id="study-switch"></select>
        <div id="study-deck-name"></div>
        <input id="only-learning" type="checkbox">
        <div id="flashcard"></div>
        <div id="card-front-text"></div>
        <div id="card-back-text"></div>
        <div id="progress-bar"></div>
        <div id="progress-text"></div>
        <button id="prev-btn"></button>
        <button id="next-btn"></button>
        <button id="known-btn"></button>
        <button id="learning-btn"></button>
        <button id="shuffle-btn"></button>
        <button id="reset-btn"></button>
        <button id="card-match-btn"></button>
        <button id="matching-restart-btn"></button>
        <button id="matching-back-btn"></button>
        <div id="matching-quiz" hidden></div>
        <div id="matching-game"></div>
        <div id="matching-score"></div>
        <div id="matching-feedback"></div>
      </body>
      </html>
    `, {
      url: "http://localhost/pages/study.html?deck=deck1"
    });

    global.window = dom.window;
    global.document = dom.window.document;
    global.history = dom.window.history;
    global.URLSearchParams = dom.window.URLSearchParams;
    global.confirm = () => true;

    global.loadDecks = () => decks;
    global.saveDecks = (data) => {
      savedDecks = structuredClone(data);
    };

    const studyPath = require.resolve("../js/study.js");
    delete require.cache[studyPath];
    require(studyPath);
  });

  afterEach(() => {
    dom.window.close();

    delete global.window;
    delete global.document;
    delete global.history;
    delete global.URLSearchParams;
    delete global.confirm;
    delete global.loadDecks;
    delete global.saveDecks;
  });

  test("marks a card as memorized", () => {
    document.getElementById("known-btn").click();

    assert.equal(decks[0].cards[0].status, "known");
  });

  test("marks a card as still learning", () => {
    document.getElementById("learning-btn").click();

    assert.equal(decks[0].cards[0].status, "learning");
  });

  test("does not change other cards", () => {
    document.getElementById("known-btn").click();

    assert.equal(decks[0].cards[1].status, "new");
    assert.equal(decks[0].cards[2].status, "new");
  });

  test("saves memorized status", () => {
    document.getElementById("known-btn").click();

    assert.equal(savedDecks[0].cards[0].status, "known");
  });

  test("updates memorization progress", () => {
    document.getElementById("known-btn").click();

    assert.equal(
      document.getElementById("progress-text").textContent,
      "1 of 3 known"
    );
  });

  test("filters out memorized cards", () => {
    document.getElementById("known-btn").click();

    const filter = document.getElementById("only-learning");
    filter.checked = true;
    filter.dispatchEvent(new dom.window.Event("change"));

    assert.equal(
      document.getElementById("card-front-text").textContent,
      "Question 2"
    );
  });

  test("resets memorization progress", () => {
    document.getElementById("known-btn").click();
    document.getElementById("reset-btn").click();

    assert.ok(
      decks[0].cards.every((card) => card.status === "new")
    );
    assert.equal(
      document.getElementById("progress-text").textContent,
      "0 of 3 known"
    );
  });
});
