// Retrieve quotes from localStorage or default to []
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

/* ============================================================
    DOM REFERENCES
============================================================ */
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");
const importFile = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const sessionLast = document.getElementById("sessionLast");
const formPlaceholder = document.getElementById("formPlaceholder");

/* ============================================================
    STEP A: Populate Category Options
============================================================ */
function populateCategories() {
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  // Restore saved filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categorySelect.value = savedFilter;
  }
}

/* ============================================================
    STEP B: Show Random Quote (filtered)
============================================================ */
function showRandomQuote() {
  let selectedCategory = categorySelect.value;

  let filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];

  quoteDisplay.innerHTML = `
    "${randomQuote.text}"<br>
    <small>- ${randomQuote.author || "Unknown"}</small>
  `;

  // Save last viewed quote in session storage
  sessionStorage.setItem("lastQuote", randomQuote.text);
  sessionLast.textContent = randomQuote.text;
}

/* ============================================================
    STEP C: Save Quotes to LocalStorage
============================================================ */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/* ============================================================
    STEP D: Add Quote Form (Dynamic)
============================================================ */
function createAddQuoteForm() {
  formPlaceholder.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="quoteText" type="text" placeholder="Quote text" />
    <input id="quoteAuthor" type="text" placeholder="Author" />
    <input id="quoteCategory" type="text" placeholder="Category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}
createAddQuoteForm();

/* ============================================================
    STEP E: Add Quote Logic
============================================================ */
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !category) {
    alert("Quote text and category are required.");
    return;
  }

  quotes.push({ text, author, category });

  saveQuotes();
  populateCategories();

  document.getElementById("quoteText").value = "";
  document.getElementById("quoteAuthor").value = "";
  document.getElementById("quoteCategory").value = "";
}

/* ============================================================
    STEP F: Filter Quotes (updates state + saves)
============================================================ */
function filterQuotes() {
  localStorage.setItem("selectedCategory", categorySelect.value);
  showRandomQuote();
}

/* ============================================================
    STEP G: Import Quotes from JSON
============================================================ */
importFile.onchange = function(event) {
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid JSON format: expected an array");
        return;
      }

      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Error reading JSON file.");
    }
  };

  reader.readAsText(event.target.files[0]);
};

/* ============================================================
    STEP H: Export Quotes to JSON
============================================================ */
exportBtn.onclick = function () {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
};

/* ============================================================
    STEP I: Clear LocalStorage
============================================================ */
document.getElementById("clearStorageBtn").onclick = function() {
  localStorage.removeItem("quotes");
  quotes = [];
  populateCategories();
  quoteDisplay.textContent = "All saved quotes cleared.";
};

/* ============================================================
    INIT ON LOAD
============================================================ */
window.onload = () => {
  populateCategories();
  filterQuotes();

  // Load last quote from session
  const last = sessionStorage.getItem("lastQuote");
  sessionLast.textContent = last || "—";
};

newQuoteBtn.onclick = showRandomQuote;
categorySelect.onchange = filterQuotes;
