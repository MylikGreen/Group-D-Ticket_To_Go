
const { JSDOM } = require("jsdom");
const { describe, test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

describe("Card Matching Quiz", () => {
  let dom;
  let decks;
  let alertMessages;

  function setupPage(url = "http://localhost/pages/study.html?deck=deck1") {
    dom = new JSDOM(
      `
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
      `,
      { url }
    );

    global.window = dom.window;
    global.document = dom.window.document;
    global.history = dom.window.history;
    global.URLSearchParams = dom.window.URLSearchParams;

    global.loadDecks = () => decks;
    global.saveDecks = () => {};
    global.alert = (message) => alertMessages.push(message);
    global.confirm = () => true;

    // Reload study.js so each test gets fresh event listeners
    // attached to its own JSDOM page.
    const studyPath = require.resolve("../js/study.js");
    delete require.cache[studyPath];
    require(studyPath);
  }

  beforeEach(() => {
    decks = [
      {
        id: "deck1",
        name: "Test Deck",
        cards: [
          { id: "1", front: "HTML", back: "Markup language", status: "new" },
          { id: "2", front: "CSS", back: "Styling language", status: "new" },
          { id: "3", front: "JavaScript", back: "Programming language", status: "new" },
          { id: "4", front: "Python", back: "General-purpose language", status: "new" },
        ],
      },
    ];

    alertMessages = [];

    setupPage();
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }

    delete global.window;
    delete global.document;
    delete global.history;
    delete global.URLSearchParams;
    delete global.loadDecks;
    delete global.saveDecks;
    delete global.alert;
    delete global.confirm;

    const studyPath = require.resolve("../js/study.js");
    delete require.cache[studyPath];
  });

  test("starts the matching quiz when the button is clicked", () => {
    document.getElementById("card-match-btn").click();

    assert.equal(
      document.getElementById("matching-quiz").hidden,
      false
    );

    assert.equal(
      document.getElementById("study-area").hidden,
      true
    );
  });

  test("shows the definition as the quiz question", () => {
    document.getElementById("card-match-btn").click();

    const definition = document.querySelector(".quiz-definition");

    assert.ok(definition);
    assert.ok(definition.textContent.length > 0);
  });

  test("provides four answer choices", () => {
    document.getElementById("card-match-btn").click();

    const buttons = document.querySelectorAll("#matching-game button");

    assert.equal(buttons.length, 4);
  });

  test("shows correct feedback when the correct answer is selected", () => {
    document.getElementById("card-match-btn").click();

    const definition =
      document.querySelector(".quiz-definition").textContent;

    const correctCard = decks[0].cards.find(
      (card) => card.back === definition
    );

    const buttons = document.querySelectorAll("#matching-game button");

    const correctButton = Array.from(buttons).find(
      (button) => button.textContent === correctCard.front
    );

    assert.ok(correctButton);

    correctButton.click();

    assert.equal(
      document.getElementById("matching-feedback").textContent,
      "Correct!"
    );
  });

  test("shows incorrect feedback when the wrong answer is selected", () => {
    document.getElementById("card-match-btn").click();

    const definition =
      document.querySelector(".quiz-definition").textContent;

    const correctCard = decks[0].cards.find(
      (card) => card.back === definition
    );

    const buttons = document.querySelectorAll("#matching-game button");

    const wrongButton = Array.from(buttons).find(
      (button) => button.textContent !== correctCard.front
    );

    assert.ok(wrongButton);

    wrongButton.click();

    assert.ok(
      document.getElementById("matching-feedback").textContent.includes(
        "Incorrect."
      )
    );
  });

  test("disables all answer choices after selecting an answer", () => {
    document.getElementById("card-match-btn").click();

    const buttons = document.querySelectorAll("#matching-game button");

    buttons[0].click();

    buttons.forEach((button) => {
      assert.equal(button.disabled, true);
    });
  });

  test("shows an alert if the deck has fewer than four cards", () => {
    decks[0].cards = decks[0].cards.slice(0, 3);

    document.getElementById("card-match-btn").click();

    assert.deepEqual(alertMessages, [
      "This quiz needs at least 4 cards to provide four answer choices.",
    ]);
  });

  test("shows an alert if no deck is selected", () => {
    // Load the study page without a selected deck.
    dom.window.close();

    decks = [];

    setupPage("http://localhost/pages/study.html");

    document.getElementById("card-match-btn").click();

    assert.deepEqual(alertMessages, [
      "Select a deck with flashcards first.",
    ]);
  });
});
