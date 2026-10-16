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

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  updateThemeButtons();

  // Search bar functionality for filtering library cards
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".nav-search input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".library-card");

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      // If the query matches any text in the card, show it; otherwise hide it
      if (text.includes(query)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
      // Universal Search & Library Filter Logic
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".nav-search");
  const searchInput = document.querySelector(".nav-search input");
  if (!searchInput) return;

  // 1. Check if there's a search term in the URL parameters (e.g., library.html?q=division)
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("q");

  if (initialQuery) {
    searchInput.value = initialQuery;
    filterLibraryCards(initialQuery);
  }

  // 2. Filter live if we are currently on the Library page
  searchInput.addEventListener("input", (e) => {
    if (window.location.pathname.includes("library.html")) {
      filterLibraryCards(e.target.value);
    }
  });

  // 3. Handle submit/Enter key press on any page
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
});

// Helper function to hide/show cards based on query
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
    });
  });
});
});
