// Shared code for every page

// Highlight the nav link for the page we're on
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll("nav a");

  links.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();
    link.classList.toggle("active", linkPage === currentPage);
  });
});

// Save and load data from the browser so decks stay after refreshing
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Decks are stored as: [{ id, name, cards: [{ id, front, back, status }] }]
// status is "new", "known", or "learning"
const DECKS_KEY = "decks";

function loadDecks() {
  try {
    const decks = loadData(DECKS_KEY);
    return Array.isArray(decks) ? decks : [];
  } catch {
    return [];
  }
}

function saveDecks(decks) {
  saveData(DECKS_KEY, decks);
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    const isDarkMode =
        document.body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", isDarkMode);
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("darkMode");

    if (savedTheme === "true") {
        document.body.classList.add("dark-mode");
    }
});