// Shared code for every page

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

function updateThemeButtons() {
  const isDark = document.body.classList.contains("dark-mode");

  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));

    const icon = button.querySelector(".theme-toggle-icon");
    if (icon) {
      icon.textContent = isDark ? "🌙" : "☀️";
    }
  });
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");

  localStorage.setItem("darkMode", String(isDark));
  updateThemeButtons();
}

// Helper to filter library cards on the page
function filterLibraryCards(query) {
  const cleanQuery = query.toLowerCase().trim();
  const cards = document.querySelectorAll(".library-card");

  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    if (text.includes(cleanQuery)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// Single consolidated DOMContentLoaded listener for the entire page
document.addEventListener("DOMContentLoaded", () => {
  // 1. Dark mode initialization
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  updateThemeButtons();

  // 2. Search bar functionality & URL query parameter handling
  const searchForm = document.querySelector(".nav-search");
  const searchInput = document.querySelector(".nav-search input");
  
  if (searchInput) {
    // Check if arriving on library.html?q=...
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("q");
    
    if (initialQuery) {
      searchInput.value = initialQuery;
      filterLibraryCards(initialQuery);
    }

    // Live filtering if typing directly on the library page
    searchInput.addEventListener("input", (e) => {
      if (window.location.pathname.includes("library.html")) {
        filterLibraryCards(e.target.value);
      }
    });

    // Handle form submit / Enter key press on any page
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        // Determine correct path to library.html based on current folder depth
        const isSubpage = window.location.pathname.includes("/pages/");
        const libraryPath = isSubpage ? "library.html" : "pages/library.html";

        // Redirect to library page with the search query in URL
        window.location.href = `${libraryPath}?q=${encodeURIComponent(query)}`;
      });
    }
  }
});