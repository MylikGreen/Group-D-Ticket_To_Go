// Study page: flip cards, mark Known / Still Learning, shuffle, track progress

let decks = loadDecks();
let deck = null;
let queue = []; // card ids in the order we're studying them
let index = 0;

const $ = (id) => document.getElementById(id);

function persist() {
  saveDecks(decks);
}

function show(id, visible) {
  $(id).hidden = !visible;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardById(id) {
  return deck.cards.find((c) => c.id === id);
}

/* ---------- Picking a deck ---------- */

function showPicker() {
  show("study-area", false);
  show("study-empty", false);
  show("study-picker", true);
  const wrap = $("study-decks");
  wrap.innerHTML = "";

  if (decks.length === 0) {
    show("study-picker", false);
    const empty = $("study-empty");
    empty.textContent = "You don't have any decks yet. Make one on the My Decks page.";
    show("study-empty", true);
    return;
  }

  decks.forEach((d) => {
    const card = document.createElement("div");
    card.className = "deck-card";
    const h = document.createElement("h3");
    h.textContent = d.name;
    const meta = document.createElement("p");
    meta.className = "deck-meta";
    const known = d.cards.filter((c) => c.status === "known").length;
    meta.textContent = `${d.cards.length} cards · ${known} known`;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn-small primary";
    b.textContent = "Study";
    b.addEventListener("click", () => startDeck(d.id));
    card.append(h, meta, b);
    wrap.appendChild(card);
  });
}

function startDeck(id) {
  deck = decks.find((d) => d.id === id);
  if (!deck) return showPicker();
  history.replaceState(null, "", "?deck=" + encodeURIComponent(id));

  const sw = $("study-switch");
  sw.innerHTML = "";
  decks.forEach((d) => {
    const o = document.createElement("option");
    o.value = d.id;
    o.textContent = d.name;
    o.selected = d.id === id;
    sw.appendChild(o);
  });

  $("study-deck-name").textContent = deck.name;
  $("only-learning").checked = false;
  buildQueue();
  show("study-picker", false);
  show("study-empty", false);
  show("study-area", true);
  render();
}

function buildQueue(shuffle) {
  let cards = deck.cards;
  if ($("only-learning").checked) {
    cards = cards.filter((c) => c.status !== "known");
  }
  const ids = cards.map((c) => c.id);
  queue = shuffle ? shuffled(ids) : ids;
  index = 0;
}

/* ---------- Showing the current card ---------- */

function setFlipped(flipped) {
  $("flashcard").classList.toggle("flipped", flipped);
}

function render() {
  const total = deck.cards.length;
  const known = deck.cards.filter((c) => c.status === "known").length;
  $("progress-bar").style.width = total ? (known / total) * 100 + "%" : "0%";
  $("progress-text").textContent = `${known} of ${total} known`;

  const empty = $("study-empty");
  if (queue.length === 0) {
    show("flashcard", false);
    show("study-empty", true);
    empty.textContent =
      total === 0
        ? "This deck has no cards yet. Add some on the My Decks page."
        : "Nice work! No cards left in this view. Uncheck the filter or reset progress to go again.";
    return;
  }

  show("flashcard", true);
  show("study-empty", false);
  const card = cardById(queue[index]);
  setFlipped(false);
  $("card-front-text").textContent = card.front;
  $("card-back-text").textContent = card.back;
  $("flashcard").dataset.status = card.status;
  $("prev-btn").disabled = index === 0;
  $("next-btn").disabled = index === queue.length - 1;
  document.title = `Card ${index + 1} of ${queue.length} | Study To-Go`;
}

function mark(status) {
  if (queue.length === 0) return;
  cardById(queue[index]).status = status;
  persist();
  // Move on automatically if there's another card
  if (index < queue.length - 1) {
    index++;
  }
  render();
}

/* ---------- Events ---------- */

$("flashcard").addEventListener("click", () => {
  $("flashcard").classList.toggle("flipped");
});
$("flashcard").addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    $("flashcard").classList.toggle("flipped");
  }
});
document.addEventListener("keydown", (e) => {
  if (!deck || e.target.matches("input, select, textarea")) return;
  if (e.key === "ArrowRight" && index < queue.length - 1) {
    index++;
    render();
  }
  if (e.key === "ArrowLeft" && index > 0) {
    index--;
    render();
  }
});

$("next-btn").addEventListener("click", () => {
  index++;
  render();
});
$("prev-btn").addEventListener("click", () => {
  index--;
  render();
});
$("known-btn").addEventListener("click", () => mark("known"));
$("learning-btn").addEventListener("click", () => mark("learning"));
$("shuffle-btn").addEventListener("click", () => {
  buildQueue(true);
  render();
});
$("only-learning").addEventListener("change", () => {
  buildQueue(false);
  render();
});
$("study-switch").addEventListener("change", (e) => startDeck(e.target.value));
$("reset-btn").addEventListener("click", () => {
  if (confirm("Reset progress for this deck?")) {
    deck.cards.forEach((c) => {
      c.status = "new";
    });
    persist();
    buildQueue(false);
    render();
  }
});

const wanted = new URLSearchParams(window.location.search).get("deck");
if (wanted && decks.some((d) => d.id === wanted)) {
  startDeck(wanted);
} else {
  showPicker();
}

/* ---------- Multiple Choice Quiz ---------- */

let quizCards = [];
let quizPosition = 0;
let quizScore = 0;
let currentQuestion = null;
let quizAnswered = false;
let quizResults = [];

function startMatchingQuiz() {
  if (!deck || deck.cards.length === 0) {
    alert("Select a deck with flashcards first.");
    return;
  }

  if (deck.cards.length < 4) {
    alert("This quiz needs at least 4 cards to provide four answer choices.");
    return;
  }

  quizCards = shuffled([...deck.cards]);
  quizPosition = 0;
  quizScore = 0;
  quizResults = [];

  show("study-area", false);
  show("study-picker", false);
  show("study-empty", false);
  show("matching-quiz", true);

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const game = $("matching-game");
  game.innerHTML = "";
  $("matching-feedback").textContent = "";

  // Show final results after every card has been answered.
  if (quizPosition >= quizCards.length) {
    showQuizResults();
    return;
  }

  currentQuestion = quizCards[quizPosition];
  quizAnswered = false;

  const questionNumber = quizPosition + 1;
  const totalQuestions = quizCards.length;
  const batchNumber = Math.floor(quizPosition / 10) + 1;
  const batchStart = Math.floor(quizPosition / 10) * 10;
  const batchEnd = Math.min(batchStart + 10, totalQuestions);

  $("matching-score").textContent =
    `Score: ${quizScore} | Question ${questionNumber} of ${totalQuestions}`;

  const batchInfo = document.createElement("p");
  batchInfo.textContent = `Set ${batchNumber}: Questions ${batchStart + 1}-${batchEnd}`;
  game.appendChild(batchInfo);

  const heading = document.createElement("h3");
  heading.textContent = "Which term matches this definition?";
  game.appendChild(heading);

  const definition = document.createElement("p");
  definition.className = "quiz-definition";
  definition.textContent = currentQuestion.back;
  game.appendChild(definition);

  // Select three different incorrect answers.
  const otherCards = shuffled(deck.cards.filter((card) => card.id !== currentQuestion.id)).slice(
    0,
    3,
  );

  // Mix the correct answer with the three incorrect answers.
  const options = shuffled([currentQuestion, ...otherCards]);

  options.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-small";
    button.textContent = card.front;

    button.addEventListener("click", () => {
      if (quizAnswered) return;
      quizAnswered = true;

      if (card.id === currentQuestion.id) {
        quizScore++;
        quizResults[quizPosition] = true;
        $("matching-feedback").textContent = "Correct!";
      } else {
        quizResults[quizPosition] = false;
        $("matching-feedback").textContent =
          `Incorrect. The correct answer is ${currentQuestion.front}.`;
      }

      $("matching-score").textContent =
        `Score: ${quizScore} | Question ${questionNumber} of ${totalQuestions}`;

      game.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
      });

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "btn-small";
      nextButton.textContent =
        questionNumber % 10 === 0 && questionNumber < totalQuestions
          ? "See Set Results"
          : questionNumber === totalQuestions
            ? "See Results"
            : "Next Question";

      nextButton.addEventListener("click", () => {
        quizPosition++;

        if (quizPosition % 10 === 0 || quizPosition >= quizCards.length) {
          showQuizResults();
        } else {
          renderQuizQuestion();
        }
      });

      game.appendChild(nextButton);
    });

    game.appendChild(button);
  });
}

function showQuizResults() {
  const game = $("matching-game");
  game.innerHTML = "";

  const totalQuestions = quizCards.length;
  const batchEnd = quizPosition;
  const batchStart = Math.floor((batchEnd - 1) / 10) * 10;

  const batchResults = quizResults.slice(batchStart, batchEnd);
  const batchScore = batchResults.filter((result) => result === true).length;
  const batchTotal = batchEnd - batchStart;
  const percent = batchTotal > 0 ? (batchScore / batchTotal) * 100 : 0;

  $("matching-score").textContent =
    `Set ${Math.floor(batchStart / 10) + 1} Score: ${batchScore} / ${batchTotal}`;

  let feedback;

  if (percent >= 90) {
    feedback = "Excellent work!";
  } else if (percent >= 70) {
    feedback = "Good job!";
  } else if (percent >= 50) {
    feedback = "Not bad, keep practicing!";
  } else {
    feedback = "Keep studying — you'll improve!";
  }

  $("matching-feedback").textContent = `${feedback} You scored ${batchScore} out of ${batchTotal}.`;

  if (batchEnd < totalQuestions) {
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "btn-small";
    nextButton.textContent = "Continue to Next Set";

    nextButton.addEventListener("click", renderQuizQuestion);
    game.appendChild(nextButton);
  } else {
    $("matching-feedback").textContent += " Quiz complete! Would you like to study again?";
  }
}

function returnToFlashcards() {
  show("matching-quiz", false);
  show("study-area", true);
  render();
}

$("card-match-btn").addEventListener("click", startMatchingQuiz);
$("matching-restart-btn").addEventListener("click", startMatchingQuiz);
$("matching-back-btn").addEventListener("click", returnToFlashcards);
