
/* global CONFIG */

console.log("assistant.js loaded");

const $ = (id) => document.getElementById(id);

let aiQuestion = null;
let aiQuestionCount = 0;

// Model names live in one place. Set CONFIG.AI_MODEL in config.js to
// override the main one. Verify names in Google AI Studio, because a wrong name gives a 404.
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODEL = "gemini-3.5-flash";

// Show any uncaught error on the page so a crash is never silent.
window.addEventListener("error", (event) => {
  const status = document.getElementById("assistant-status");
  if (status) status.textContent = `Script error: ${event.message}`;
});

window.addEventListener("unhandledrejection", (event) => {
  const status = document.getElementById("assistant-status");
  if (status) status.textContent = `Error: ${event.reason?.message || event.reason}`;
});

// loadDecks may be missing if main.js failed to load, so fall back safely.
const assistantDecks = typeof loadDecks === "function" ? loadDecks() : [];

// Fill the deck dropdown. Safe to call again after a new deck is added.
function populateDecks() {
  const select = $("assistant-deck");

  // NEW: keep the first "No deck" option and rebuild the rest.
  while (select.options.length > 1) {
    select.remove(1);
  }

  // Tell the user when no decks are found instead of failing silently.
  if (assistantDecks.length === 0) {
    $("assistant-status").textContent =
      "No saved decks found on this address. Paste notes instead, or make a deck first.";
  }

  assistantDecks.forEach((deck, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = deck.name || deck.title || `Deck ${index + 1}`;
    select.appendChild(option);
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Send the request, retrying if Gemini is overloaded (503).
async function fetchWithRetry(model, apiKey, requestBody) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  let response;

  for (let attempt = 1; attempt <= 2; attempt++) {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(60000),
      body: requestBody,
    });

    if (response.status !== 503) return response;

    await sleep(attempt * 1500);
  }

  return response;
}

// NEW: shared Gemini call. Sends a prompt and returns the parsed JSON reply.
// Both the quiz and the deck creator use this.
async function askGemini(prompt) {
  // typeof check, so a missing config.js gives a clear message
  // instead of a ReferenceError.
  if (typeof CONFIG === "undefined") {
    throw new Error(
      "config.js was not found. Copy config.example.js to js/config.js and add your key.",
    );
  }

  const apiKey = CONFIG.AI_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    throw new Error("Please set your AI API key in config.js.");
  }

  const model = CONFIG.AI_MODEL || DEFAULT_MODEL;

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    // Ask Gemini for raw JSON so parsing is more reliable.
    generationConfig: { responseMimeType: "application/json" },
  });

  let response;

  try {
    response = await fetchWithRetry(model, apiKey, requestBody);

    // Still overloaded after retries? Try the backup model once.
    if (response.status === 503 && model !== FALLBACK_MODEL) {
      response = await fetchWithRetry(FALLBACK_MODEL, apiKey, requestBody);
    }
  } catch (error) {
    console.error("Gemini connection error:", error);

    if (error.name === "TimeoutError") {
      throw new Error(
        "Gemini took too long to respond. Please try again.",
      );
    }

    if (error.name === "AbortError") {
      throw new Error("The Gemini request was cancelled. Please try again.");
    }

    throw new Error(
      "Could not connect to Gemini. Check your internet connection and try again.",
    );
  }

  // Handle API errors.
  if (!response.ok) {
    const errorDetails = await response.text();

    console.error("Gemini API error:", response.status, errorDetails);

    if (response.status === 503) {
      throw new Error(
        "Gemini is overloaded right now. Please wait and try again.",
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Gemini's request limit has been reached. Please wait and try again.",
      );
    }

    // 400/403 usually mean a bad or restricted API key.
    if (response.status === 400 || response.status === 403) {
      throw new Error(
        "Gemini rejected the request. Check that your API key in config.js is valid.",
      );
    }

    if (response.status === 404) {
      throw new Error(
        `The Gemini model "${model}" was not found. Check the model name in assistant.js.`,
      );
    }

    throw new Error(
      `Gemini API request failed (${response.status}): ${errorDetails}`,
    );
  }

  // Read Gemini's response.
  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    console.error("Unexpected Gemini response:", data);

    throw new Error(
      "Gemini returned no result. Check the browser console for details.",
    );
  }

  // Remove code fences if Gemini includes them.
  const cleanedText = generatedText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    console.error("Could not parse Gemini response:", generatedText);

    throw new Error("Gemini returned invalid JSON. Please try again.");
  }
}

// Generate one question using Gemini.
async function generateAIQuestions() {
  const selectedIndex = $("assistant-deck").value;
  const notes = $("assistant-notes").value.trim();
  const customInstructions = $("ai-question-prompt").value.trim();

  const selectedDeck =
    selectedIndex === "" ? null : assistantDecks[Number(selectedIndex)];

  const cards =
    selectedDeck?.cards?.map((card) => ({
      term: card.front,
      definition: card.back,
    })) || [];

  if (cards.length === 0 && !notes) {
    throw new Error(
      "Choose a deck with flashcards or paste your notes first.",
    );
  }

  const prompt = `
You are a helpful study assistant.

Generate ONE multiple-choice practice question based ONLY on the study material provided.

Flashcards:
${JSON.stringify(cards)}

User notes:
${notes || "No additional notes provided."}

User's requested question style:
${customInstructions || "Use a mix of clear, useful questions."}

Return ONLY valid JSON in this exact format:
{
  "question": "Question text",
  "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
  "correctAnswer": "Choice A",
  "explanation": "Short explanation"
}

Rules:
- Generate exactly one question.
- Provide exactly 4 answer choices.
- Only one answer should be correct.
- The correctAnswer must exactly match one of the choices.
- Use only the supplied study material.
- Do not include markdown or text outside the JSON.
`;

  const question = await askGemini(prompt);

  // Validate the generated question.
  if (
    !question.question ||
    !Array.isArray(question.choices) ||
    question.choices.length !== 4 ||
    !question.choices.includes(question.correctAnswer) ||
    !question.explanation
  ) {
    console.error("Invalid question returned by Gemini:", question);

    throw new Error("Gemini returned an invalid question. Please try again.");
  }

  return question;
}

// Generate and display a question.
async function loadAIQuestion() {
  $("assistant-status").textContent = "Generating question...";
  $("assistant-question").textContent = "";
  $("assistant-choices").innerHTML = "";
  $("assistant-feedback").textContent = "";
  $("assistant-next-btn").hidden = true;

  try {
    aiQuestion = await generateAIQuestions();
    aiQuestionCount++;

    $("assistant-status").textContent = `Question ${aiQuestionCount}`;
    $("assistant-setup").hidden = true;
    // NEW: hide the deck creator while the quiz is showing.
    $("assistant-create-deck").hidden = true;
    $("assistant-quiz").hidden = false;

    renderAIQuestion();
  } catch (error) {
    console.error(error);

    $("assistant-status").textContent =
      error.message || "Could not generate a question. Please try again.";
  }
}

// Display the question and four answer choices.
function renderAIQuestion() {
  $("assistant-question").textContent = aiQuestion.question;

  const choicesContainer = $("assistant-choices");
  choicesContainer.innerHTML = "";

  aiQuestion.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-small";
    button.textContent = choice;

    button.addEventListener("click", () => checkAIAnswer(choice));
    choicesContainer.appendChild(button);
  });
}

// Check the answer and show feedback.
function checkAIAnswer(choice) {
  $("assistant-choices").querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });

  if (choice === aiQuestion.correctAnswer) {
    $("assistant-feedback").textContent =
      `Correct! ${aiQuestion.explanation}`;
  } else {
    $("assistant-feedback").textContent =
      `Incorrect. The correct answer is: ${aiQuestion.correctAnswer}. ${aiQuestion.explanation}`;
  }

  $("assistant-next-btn").hidden = false;
}

/* ---------- NEW: Create a deck from notes ---------- */

// Make a unique id for decks and cards.
function makeAssistantId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

const MAX_CARDS = 50; // Limit the number of cards Gemini can generate at once.

// Ask Gemini for flashcards based on the pasted notes.
// Gemini decides how many cards the notes need.
async function generateFlashcards(notes) {
  const prompt = `
You are a helpful study assistant.

Turn the notes below into flashcards. Decide how many cards are needed so
that every important term, concept, and fact is covered once. Short notes
need only a few cards, and long notes need more. Never create more than
${MAX_CARDS} cards.

Notes:
${notes}

Return ONLY valid JSON in this exact format:
{
  "cards": [
    { "front": "Term or question", "back": "Definition or answer" }
  ]
}

Rules:
- Use only the information in the notes.
- Each front should be a short term or question.
- Each back should be a clear, concise answer.
- Do not repeat the same card.
- Do not pad the deck with trivial or filler cards.
- Do not include markdown or text outside the JSON.
`;

  const result = await askGemini(prompt);

  // Keep only cards that have both sides filled in.
  const cards = Array.isArray(result.cards) ? result.cards : [];
  const validCards = cards
    .filter(
      (card) =>
        typeof card.front === "string" &&
        typeof card.back === "string" &&
        card.front.trim() &&
        card.back.trim(),
    )
    .slice(0, MAX_CARDS);

  if (validCards.length === 0) {
    console.error("Invalid flashcards returned by Gemini:", result);

    throw new Error("Gemini returned no usable flashcards. Please try again.");
  }

  return validCards;
}

// Build the deck, save it, and update the page.
async function createDeckFromNotes() {
  const notes = $("assistant-notes").value.trim();
  const name = $("assistant-deck-name").value.trim();

  if (!notes) {
    throw new Error("Paste your notes first so the cards have something to use.");
  }

  if (!name) {
    throw new Error("Give your new deck a name.");
  }

  if (typeof saveDecks !== "function") {
    throw new Error("Could not save the deck because main.js did not load.");
  }

  const generated = await generateFlashcards(notes);

  // Same shape study.js expects: id, name, and cards with a status.
  const newDeck = {
    id: makeAssistantId(),
    name,
    cards: generated.map((card) => ({
      id: makeAssistantId(),
      front: card.front.trim(),
      back: card.back.trim(),
      status: "new",
    })),
  };

  assistantDecks.push(newDeck);
  saveDecks(assistantDecks);

  return newDeck;
}

/* ---------- Events ---------- */

// Start generating questions.
$("ai-practice-generate-btn").addEventListener("click", () => {
  console.log("Generate clicked");
  aiQuestionCount = 0;
  loadAIQuestion();
});

// Load another question.
$("assistant-next-btn").addEventListener("click", loadAIQuestion);

// NEW: create a deck from the notes.
$("create-deck-btn").addEventListener("click", async () => {
  const button = $("create-deck-btn");
  button.disabled = true;
  $("assistant-deck-link").hidden = true;
  $("assistant-status").textContent = "Creating your deck...";

  try {
    const newDeck = await createDeckFromNotes();

    populateDecks();
    $("assistant-deck-name").value = "";

    $("assistant-status").textContent =
      `Created "${newDeck.name}" with ${newDeck.cards.length} cards.`;
    $("assistant-deck-link").href =
      "study.html?deck=" + encodeURIComponent(newDeck.id);
    $("assistant-deck-link").hidden = false;
  } catch (error) {
    console.error(error);

    $("assistant-status").textContent =
      error.message || "Could not create the deck. Please try again.";
  } finally {
    button.disabled = false;
  }
});

// Return to the setup form.
$("assistant-back-btn").addEventListener("click", () => {
  $("assistant-quiz").hidden = true;
  $("assistant-setup").hidden = false;
  // NEW: show the deck creator again.
  $("assistant-create-deck").hidden = false;

  $("assistant-status").textContent =
    "Choose a deck or paste notes to get started.";

  $("assistant-question").textContent = "";
  $("assistant-choices").innerHTML = "";
  $("assistant-feedback").textContent = "";

  aiQuestion = null;
  aiQuestionCount = 0;
});

// Initialize the page.
populateDecks();
