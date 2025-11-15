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
const categorySelect = document.getElementById("categorySelect");

// Load categories into dropdown
function loadCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categorySelect.innerHTML = ""; 
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;

  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Add a new quote to the array and update DOM
function addQuote(newText, newCategory) {
  if (!newText || !newCategory) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });

  loadCategories();
  alert("Quote added!");
}

// Create the "Add Quote" form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.style.marginTop = "20px";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.id = "dynamicQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.id = "dynamicQuoteCategory";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  addButton.addEventListener("click", () => {
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    addQuote(text, category);

    textInput.value = "";
    categoryInput.value = "";
  });

  // Append elements
  formContainer.appendChild(title);
  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Insert the form into the body
  document.body.appendChild(formContainer);
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize page
loadCategories();
showRandomQuote();
createAddQuoteForm();
