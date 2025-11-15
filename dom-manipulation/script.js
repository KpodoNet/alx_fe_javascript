// ===== Dynamic Quote Generator with localStorage, sessionStorage, Import/Export =====

// --- Constants for storage keys
const LS_KEY = "dynamicQuotes_v1"; // localStorage key
const SS_LAST_QUOTE_KEY = "dynamicQuotes_lastViewed"; // sessionStorage key

// --- Default quotes (used if nothing in localStorage)
const DEFAULT_QUOTES = [
  { text: "The future depends on what you do today.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Tech" },
  { text: "Creativity takes courage.", category: "Art" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Tech" }
];

// --- App state
let quotes = [];

// --- DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const clearStorageBtn = document.getElementById("clearStorageBtn");
const sessionLastSpan = document.getElementById("sessionLast");
const formPlaceholder = document.getElementById("formPlaceholder");

// ------------------ Storage Helpers ------------------

// Save quotes array to localStorage (stringified)
function saveQuotes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
    alert("Could not save quotes to localStorage.");
  }
}

// Load quotes from localStorage; fallback to DEFAULT_QUOTES
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes(); // seed localStorage
      return;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Stored data is not an array.");
    // minimal validation of structure
    quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    if (quotes.length === 0) {
      // If parse produced nothing valid, use default
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
    }
  } catch (err) {
    console.error("Failed to load quotes, using defaults:", err);
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  }
}

// Use sessionStorage to persist last viewed quote text for this browser tab/session
function saveLastViewedToSession(quoteText) {
  try {
    const payload = { text: quoteText, at: new Date().toISOString() };
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(payload));
    renderSessionLast();
  } catch (err) {
    console.warn("Could not save session data", err);
  }
}

function loadSessionLast() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderSessionLast() {
  const last = loadSessionLast();
  if (!last) {
    sessionLastSpan.textContent = "—";
    return;
  }
  // show short preview + time
  const when = new Date(last.at).toLocaleTimeString();
  const short = last.text.length > 40 ? last.text.slice(0, 37) + "…" : last.text;
  sessionLastSpan.textContent = `"${short}" at ${when}`;
}

// ------------------ UI / DOM Manipulation ------------------

// Build category dropdown from quotes
function loadCategories() {
  const categories = [...new Set(quotes.map(q => q.category))].sort((a,b)=>a.localeCompare(b));
  categorySelect.innerHTML = "";
  // add "All" option to show quotes from all categories
  const allOption = document.createElement("option");
  allOption.value = "__ALL__";
  allOption.textContent = "All";
  categorySelect.appendChild(allOption);
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Display a random quote (optionally from selected category)
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filtered = quotes;
  if (selectedCategory && selectedCategory !== "__ALL__") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const idx = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[idx];
  quoteDisplay.textContent = chosen.text;
  // Save last shown quote to session storage
  saveLastViewedToSession(chosen.text);
}

// Adds quote to state and persists
function addQuote(newText, newCategory) {
  if (!newText || !newCategory) {
    alert("Please enter both quote text and a category.");
    return;
  }
  const sanitizedText = newText.trim();
  const sanitizedCategory = newCategory.trim();
  // Optional: avoid duplicate exact quotes
  const exists = quotes.some(q => q.text === sanitizedText && q.category === sanitizedCategory);
  if (exists) {
    alert("This exact quote already exists in the selected category.");
    return;
  }
  quotes.push({ text: sanitizedText, category: sanitizedCategory });
  saveQuotes();
  loadCategories();
  alert("Quote added and saved.");
}

// Dynamically create Add-Quote form + import/export controls (keeps markup minimal)
function createAddQuoteForm() {
  const container = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";
  container.appendChild(title);

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.id = "dynamicQuoteText";
  container.appendChild(textInput);

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.id = "dynamicQuoteCategory";
  container.appendChild(categoryInput);

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", () => {
    addQuote(textInput.value, categoryInput.value);
    textInput.value = "";
    categoryInput.value = "";
  });
  container.appendChild(addButton);

  // small help text
  const note = document.createElement("small");
  note.textContent = "Tip: category names are case-sensitive (you can standardize if you want).";
  container.appendChild(note);

  // attach to placeholder
  formPlaceholder.appendChild(container);
}

// ------------------ Import / Export ------------------

// Export quotes as JSON file (Blob + URL.createObjectURL)
function exportQuotesToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `quotes_export_${new Date().toISOString().slice(0,10)}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Could not export quotes. See console for details.");
  }
}

// Import from a JSON file selected by user - basic validation & merge
function importFromJsonFile(file) {
  if (!file) {
    alert("No file selected for import.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) {
        throw new Error("Imported JSON must be an array of quote objects.");
      }
      // validate objects have text & category strings
      const validItems = parsed.filter(item =>
        item && typeof item.text === "string" && typeof item.category === "string"
      ).map(item => ({ text: item.text.trim(), category: item.category.trim() }));

      if (validItems.length === 0) {
        alert("No valid quote objects found in the file.");
        return;
      }

      // Merge: avoid exact duplicates (text + category)
      let added = 0;
      validItems.forEach(it => {
        const exists = quotes.some(q => q.text === it.text && q.category === it.category);
        if (!exists) {
          quotes.push(it);
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        loadCategories();
      }

      alert(`Imported ${validItems.length} items. ${added} new quotes were added (duplicates skipped).`);
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import JSON: " + (err.message || err));
    }
  };

  reader.onerror = function() {
    alert("Failed to read file.");
  };

  reader.readAsText(file);
}

// ------------------ Utility / Button wiring ------------------

// Clears saved quotes from localStorage and reloads defaults
function clearSavedQuotes() {
  if (!confirm("This will remove all saved quotes and reset to defaults. Continue?")) return;
  localStorage.removeItem(LS_KEY);
  loadQuotes();
  loadCategories();
  quoteDisplay.textContent = "Quotes reset to defaults.";
  sessionStorage.removeItem(SS_LAST_QUOTE_KEY);
  renderSessionLast();
}

// ------------------ Initialize App ------------------

function init() {
  loadQuotes();
  createAddQuoteForm();
  loadCategories();

  // event bindings
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importFromJsonFile(file);
    // reset input so same file can be imported again if needed
    importFileInput.value = "";
  });
  clearStorageBtn.addEventListener("click", clearSavedQuotes);

  // show a quote on load if session has last viewed quote, else pick random
  const last = loadSessionLast();
  if (last && typeof last.text === "string") {
    quoteDisplay.textContent = last.text;
  } else {
    showRandomQuote();
  }

  renderSessionLast();
}

// Run
init();
