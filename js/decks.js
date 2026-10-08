// My Decks page: create, rename, delete decks and add, edit, delete cards

let decks = loadDecks();
let openDeckId = null;
let editingCardId = null;

const $ = (id) => document.getElementById(id);
const listView = $("deck-list-view");
const editView = $("deck-edit-view");

function persist() {
  saveDecks(decks);
}

function getOpenDeck() {
  return decks.find((d) => d.id === openDeckId);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, className, onClick) {
  const b = el("button", className, label);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

/* ---------- Deck list ---------- */

function renderDecks() {
  const wrap = $("decks");
  wrap.innerHTML = "";

  if (decks.length === 0) {
    wrap.appendChild(el("div", "placeholder", "No decks yet. Add one above to get started."));
    return;
  }

  decks.forEach((deck) => {
    const known = deck.cards.filter((c) => c.status === "known").length;
    const card = el("div", "deck-card");
    card.appendChild(el("h3", "", deck.name));
    card.appendChild(el("p", "deck-meta", `${deck.cards.length} card${deck.cards.length === 1 ? "" : "s"} · ${known} known`));

    const actions = el("div", "row-actions");
    actions.appendChild(button("Edit", "btn-small primary", () => openDeck(deck.id)));
    actions.appendChild(button("Study", "btn-small", () => {
      window.location.href = "study.html?deck=" + encodeURIComponent(deck.id);
    }));
    actions.appendChild(button("Delete", "btn-small danger", () => {
      if (confirm(`Delete "${deck.name}" and all its cards?`)) {
        decks = decks.filter((d) => d.id !== deck.id);
        persist();
        renderDecks();
      }
    }));
    card.appendChild(actions);
    wrap.appendChild(card);
  });
}

$("new-deck-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("new-deck-name");
  const name = input.value.trim();
  if (!name) {
    $("deck-error").textContent = "Give your deck a name first.";
    return;
  }
  $("deck-error").textContent = "";
  decks.push({ id: makeId(), name, cards: [] });
  persist();
  input.value = "";
  renderDecks();
});

/* ---------- Deck editor ---------- */

function openDeck(id) {
  openDeckId = id;
  resetCardForm();
  listView.hidden = true;
  editView.hidden = false;
  renderEditor();
}

function closeDeck() {
  openDeckId = null;
  editView.hidden = true;
  listView.hidden = false;
  renderDecks();
}

function renderEditor() {
  const deck = getOpenDeck();
  if (!deck) return closeDeck();
  $("deck-title").textContent = deck.name;

  const wrap = $("cards");
  wrap.innerHTML = "";

  if (deck.cards.length === 0) {
    wrap.appendChild(el("div", "placeholder", "This deck is empty. Add your first card above."));
    return;
  }

  deck.cards.forEach((c, i) => {
    const row = el("div", "card-row");
    row.appendChild(el("span", "card-num", String(i + 1)));
    const body = el("div", "card-text");
    body.appendChild(el("strong", "", c.front));
    body.appendChild(el("p", "", c.back));
    row.appendChild(body);

    const actions = el("div", "row-actions");
    actions.appendChild(button("Edit", "btn-small", () => startEditCard(c.id)));
    actions.appendChild(button("Delete", "btn-small danger", () => {
      if (confirm("Delete this card?")) {
        deck.cards = deck.cards.filter((x) => x.id !== c.id);
        if (editingCardId === c.id) resetCardForm();
        persist();
        renderEditor();
      }
    }));
    row.appendChild(actions);
    wrap.appendChild(row);
  });
}

function resetCardForm() {
  editingCardId = null;
  $("card-front").value = "";
  $("card-back").value = "";
  $("card-error").textContent = "";
  $("card-form-title").textContent = "Add a card";
  $("card-submit").textContent = "Add Card";
  $("card-cancel").hidden = true;
}

function startEditCard(cardId) {
  const card = getOpenDeck().cards.find((c) => c.id === cardId);
  if (!card) return;
  editingCardId = cardId;
  $("card-front").value = card.front;
  $("card-back").value = card.back;
  $("card-form-title").textContent = "Edit card";
  $("card-submit").textContent = "Save Changes";
  $("card-cancel").hidden = false;
  $("card-error").textContent = "";
  $("card-front").focus();
  $("card-form").scrollIntoView({ behavior: "smooth", block: "center" });
}

$("card-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const deck = getOpenDeck();
  const front = $("card-front").value.trim();
  const back = $("card-back").value.trim();

  // Empty cards can't be saved
  if (!front || !back) {
    $("card-error").textContent = "Both the front and the back need some text.";
    return;
  }

  if (editingCardId) {
    const card = deck.cards.find((c) => c.id === editingCardId);
    card.front = front;
    card.back = back;
  } else {
    deck.cards.push({ id: makeId(), front, back, status: "new" });
  }
  persist();
  resetCardForm();
  renderEditor();
  $("card-front").focus();
});

$("card-cancel").addEventListener("click", resetCardForm);
$("back-btn").addEventListener("click", closeDeck);

$("rename-deck").addEventListener("click", () => {
  const deck = getOpenDeck();
  const name = prompt("Rename deck:", deck.name);
  if (name && name.trim()) {
    deck.name = name.trim().slice(0, 60);
    persist();
    renderEditor();
  }
});

$("study-deck").addEventListener("click", () => {
  window.location.href = "study.html?deck=" + encodeURIComponent(openDeckId);
});

renderDecks();
