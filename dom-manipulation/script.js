// Retrieve quotes from localStorage
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

/* -----------------------------
   DOM References
------------------------------ */
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const importFile = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const sessionLast = document.getElementById("sessionLast");
const formPlaceholder = document.getElementById("formPlaceholder");

/* ----------------------------------------------------
   Populate Category Dropdown
---------------------------------------------------- */
function populateCategories() {
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

/* ----------------------------------------------------
   Show Random Quote (Based on Filter)
---------------------------------------------------- */
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomQuote =
    filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

  quoteDisplay.innerHTML = `
    "${randomQuote.text}"<br>
    <small>- ${randomQuote.author || "Unknown"}</small>
  `;

  sessionStorage.setItem("lastQuote", randomQuote.text);
  sessionLast.textContent = randomQuote.text;
}

/* ----------------------------------------------------
   Save Quotes
---------------------------------------------------- */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/* ----------------------------------------------------
   Create Add Quote Form
---------------------------------------------------- */
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

/* ----------------------------------------------------
   Add Quote
---------------------------------------------------- */
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

/* ----------------------------------------------------
   Filter Quotes
---------------------------------------------------- */
function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  showRandomQuote();
}

/* ----------------------------------------------------
   Import JSON
---------------------------------------------------- */
importFile.onchange = function (event) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid JSON format.");
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

/* ----------------------------------------------------
   Export JSON
---------------------------------------------------- */
exportBtn.onclick = function () {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
};

/* ----------------------------------------------------
   Clear LocalStorage
---------------------------------------------------- */
document.getElementById("clearStorageBtn").onclick = () => {
  localStorage.removeItem("quotes");
  quotes = [];
  populateCategories();
  quoteDisplay.textContent = "All saved quotes cleared.";
};

/* ----------------------------------------------------
   Initialize App
---------------------------------------------------- */
window.onload = () => {
  populateCategories();
  filterQuotes();

  const lastQuote = sessionStorage.getItem("lastQuote");
  sessionLast.textContent = lastQuote || "—";
};

newQuoteBtn.onclick = showRandomQuote;
categoryFilter.onchange = filterQuotes;
