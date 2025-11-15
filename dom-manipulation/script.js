// Initial Quote Data
let quotes = [
  { text: "The future depends on what you do today.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Tech" },
  { text: "Creativity takes courage.", category: "Art" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Tech" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categorySelect = document.getElementById("categorySelect");

// Load categories into dropdown
function loadCategories() {
  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categorySelect.innerHTML = ""; 
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;

  // Filter quotes by category
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both a quote and category.");
    return;
  }

  // Add quote to array
  quotes.push({ text: newText, category: newCategory });

  // Rebuild category list
  loadCategories();

  // Clear fields
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added!");
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize on load
loadCategories();
showRandomQuote();
