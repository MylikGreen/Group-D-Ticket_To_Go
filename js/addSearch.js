/* global module */
/* eslint-env node */
// Validation function for search queries
function addSearch(query) {
  if (query === null || query === undefined || typeof query !== "string") {
    return false;
  }
  if (!query.trim()) {
    return false;
  }
  if (query.length > 255) {
    return false;
  }
  return true;
}

// Only run DOM code when running in the browser
if (typeof document !== "undefined") {
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

  document.addEventListener("DOMContentLoaded", () => {
    // Search bar functionality & URL query parameter handling
    const searchForm = document.querySelector(".nav-search");
    const searchInput = document.querySelector(".nav-search input");
    
    if (searchInput) {
      const urlParams = new URLSearchParams(window.location.search);
      const initialQuery = urlParams.get("q");
      if (initialQuery && addSearch(initialQuery)) {
        searchInput.value = initialQuery;
        filterLibraryCards(initialQuery);
      }

      searchInput.addEventListener("input", (e) => {
        if (window.location.pathname.includes("library.html")) {
          const query = e.target.value;
          if (addSearch(query)) {
            filterLibraryCards(query);
          } else {
            filterLibraryCards("");
          }
        }
      });

      if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const query = searchInput.value;

          if (!addSearch(query)) {
            return;
          }

          const cleanQuery = query.trim();
          const isInPagesFolder = window.location.pathname.includes("/pages/");
          const libraryPath = isInPagesFolder ? "library.html" : "pages/library.html";

          window.location.href = `${libraryPath}?q=${encodeURIComponent(cleanQuery)}`;
        });
      }
    }
  });
}

// Universal export for Node.js test runners (Handles both require() and require().addSearch)
if (typeof module !== "undefined" && module.exports) {
  module.exports = addSearch;
  module.exports.addSearch = addSearch;
}