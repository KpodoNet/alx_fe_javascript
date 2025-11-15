/* =========================
    QUOTES ARRAY & STORAGE
========================= */
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

/* =========================
    DISPLAY FUNCTIONS
========================= */
function displayQuotes(quoteArray) {
  const container = document.getElementById("quoteDisplay");
  container.innerHTML = "";

  if (quoteArray.length === 0) {
    container.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  // Pick a random quote from the filtered array
  const quote = quoteArray[Math.floor(Math.random() * quoteArray.length)];
  container.innerHTML = `
    <p>"${quote.text}"</p>
    <small>- ${quote.author}</small>
    <br><span class="category-label">${quote.category}</span>
  `;

  // Save last shown quote in session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  document.getElementById("sessionLast").textContent = quote.text;
}

/* =========================
    CATEGORY FILTER FUNCTIONS
========================= */
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);

  let filteredQuotes = quotes;
  if (category !== "all") filteredQuotes = quotes.filter(q => q.category === category);

  displayQuotes(filteredQuotes);
}

/* =========================
    ADD NEW QUOTE
========================= */
function addQuote() {
  const textInput = document.getElementById("quoteText");
  const authorInput = document.getElementById("quoteAuthor");
  const categoryInput = document.getElementById("quoteCategory");

  if (!textInput.value || !authorInput.value || !categoryInput.value) {
    alert("Please fill in all fields!");
    return;
  }

  const newQuote = {
    text: textInput.value,
    author: authorInput.value,
    category: categoryInput.value
  };

  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  filterQuotes();

  textInput.value = "";
  authorInput.value = "";
  categoryInput.value = "";
}

/* =========================
    JSON IMPORT / EXPORT
========================= */
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

/* =========================
    SERVER SYNC SIMULATION
========================= */
const serverEndpoint = "https://jsonplaceholder.typicode.com/posts"; // mock API

async function fetchServerQuotes() {
  try {
    const response = await fetch(serverEndpoint);
    const serverData = await response.json();

    const serverQuotes = serverData.map((item, index) => ({
      text: item.title || `Quote ${index + 1}`,
      author: item.userId ? `User ${item.userId}` : "Unknown",
      category: "Server"
    }));

    let newQuotesAdded = false;
    serverQuotes.forEach(sq => {
      if (!quotes.some(lq => lq.text === sq.text && lq.author === sq.author)) {
        quotes.push(sq);
        newQuotesAdded = true;
      }
    });

    if (newQuotesAdded) {
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      filterQuotes();
      console.log("Quotes synced with server!");
    }
  } catch (err) {
    console.error("Server sync failed:", err);
  }
}

// Sync every 30 seconds
setInterval(fetchServerQuotes, 30000);

/* =========================
    CREATE FORM DYNAMICALLY
========================= */
function createAddQuoteForm() {
  const formContainer = document.getElementById("formPlaceholder");
  formContainer.innerHTML = `
    <h3>Add a New Quote</h3>
    <input type="text" id="quoteText" placeholder="Quote text" />
    <input type="text" id="quoteAuthor" placeholder="Author" />
    <input type="text" id="quoteCategory" placeholder="Category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

/* =========================
    INIT
========================= */
window.onload = function () {
  createAddQuoteForm();
  populateCategories();
  filterQuotes();

  // Restore last session quote
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) document.getElementById("sessionLast").textContent = lastQuote.text;

  // Attach import/export listeners
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document.getElementById("newQuote").addEventListener("click", filterQuotes); // random quote in filtered
  document.getElementById("clearStorageBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all saved quotes?")) {
      localStorage.removeItem("quotes");
      quotes = [];
      populateCategories();
      filterQuotes();
    }
  });

  // Attach category filter listener
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
};

