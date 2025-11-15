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
    category: categoryInput.value,
    synced: false // mark as unsynced for server push
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
      importedQuotes.forEach(q => q.synced = false); // mark all imported as unsynced
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
    SERVER SYNC FUNCTIONS
========================= */
const serverEndpoint = "https://jsonplaceholder.typicode.com/posts"; // mock API

// Fetch quotes from server and merge with local
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverEndpoint);
    const serverData = await response.json();

    const serverQuotes = serverData.map((item, index) => ({
      text: item.title || `Quote ${index + 1}`,
      author: item.userId ? `User ${item.userId}` : "Unknown",
      category: "Server",
      synced: true
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
    console.error("Server fetch failed:", err);
  }
}

// Push unsynced local quotes to server
async function syncLocalQuotesToServer() {
  const unsynced = quotes.filter(q => !q.synced);
  for (const quote of unsynced) {
    try {
      const response = await fetch(serverEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote)
      });
      if (response.ok) quote.synced = true;
    } catch (err) {
      console.error("Failed to POST quote:", quote, err);
    }
  }
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Full two-way sync
async function syncQuotes() {
  await fetchQuotesFromServer();
  await syncLocalQuotesToServer();
  console.log("Two-way sync complete!");
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

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

  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) document.getElementById("sessionLast").textContent = lastQuote.text;

  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document.getElementById("newQuote").addEventListener("click", filterQuotes);
  document.getElementById("clearStorageBtn").addEventListener("click", () => {
    if (confirm("Clear all saved quotes?")) {
      localStorage.removeItem("quotes");
      quotes = [];
      populateCategories();
      filterQuotes();
    }
  });

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

  // Initial sync
  syncQuotes();
};

