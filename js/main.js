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
