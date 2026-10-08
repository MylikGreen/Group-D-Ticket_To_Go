// Study page: flip cards, mark Known / Still Learning, shuffle, track progress

let decks = loadDecks();
let deck = null;
let queue = [];   // card ids in the order we're studying them
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
    empty.textContent = total === 0
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
  if (e.key === "ArrowRight" && index < queue.length - 1) { index++; render(); }
  if (e.key === "ArrowLeft" && index > 0) { index--; render(); }
});

$("next-btn").addEventListener("click", () => { index++; render(); });
$("prev-btn").addEventListener("click", () => { index--; render(); });
$("known-btn").addEventListener("click", () => mark("known"));
$("learning-btn").addEventListener("click", () => mark("learning"));
$("shuffle-btn").addEventListener("click", () => { buildQueue(true); render(); });
$("only-learning").addEventListener("change", () => { buildQueue(false); render(); });
$("study-switch").addEventListener("change", (e) => startDeck(e.target.value));
$("reset-btn").addEventListener("click", () => {
  if (confirm("Reset progress for this deck?")) {
    deck.cards.forEach((c) => { c.status = "new"; });
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
