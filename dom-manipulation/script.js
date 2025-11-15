/* -----------------------------
   SERVER SYNC SIMULATION CONFIG
----------------------------- */

// Mock server endpoint using JSONPlaceholder-style API
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; 
// (We’ll only POST/GET fake data; JSONPlaceholder won’t save it, but the flow works.)

let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

/* --------------------------------------------------
   1. Fetch quotes FROM the server (simulated)
--------------------------------------------------- */
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();

    // Simulate server storing quotes in "body"
    const serverQuotes = serverData.slice(0, 10).map(item => ({
      text: item.body,
      category: "Server",
      id: item.id
    }));

    return serverQuotes;

  } catch (err) {
    console.error("Server fetch error:", err);
    return [];
  }
}

/* --------------------------------------------------
   2. Send new quotes TO server (simulated)
--------------------------------------------------- */
async function pushLocalQuotesToServer(newQuote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newQuote)
    });
    // We don’t expect the server to save this, but we simulate a “push”
  } catch (err) {
    console.error("Server push error:", err);
  }
}

/* --------------------------------------------------
   3. Sync Logic — Server Wins on Conflict
--------------------------------------------------- */
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Compare timestamps or IDs to detect conflicts
  // Simpler rule: SERVER ALWAYS WINS
  const merged = mergeQuotes(serverQuotes, localQuotes);

  // Save merged data
  localStorage.setItem("quotes", JSON.stringify(merged));

  // Update the UI automatically
  displayQuotes(merged);

  notifyUser("Quotes synced with server ✔");
}

/* --------------------------------------------------
   Merge Function With Conflict Resolution
--------------------------------------------------- */
function mergeQuotes(server, local) {
  const finalList = [...server];

  local.forEach(lq => {
    const exists = server.some(sq => sq.id === lq.id);
    if (!exists) finalList.push(lq);
  });

  return finalList;
}

/* --------------------------------------------------
   4. Auto Sync Every 15 Seconds
--------------------------------------------------- */
setInterval(() => {
  syncQuotes();
}, 15000);

/* --------------------------------------------------
   5. Add Quote + Push to Server
--------------------------------------------------- */
function addQuote() {
  const quoteText = document.getElementById("quoteInput").value;
  const categoryText = document.getElementById("categoryInput").value;

  if (!quoteText || !categoryText) {
    alert("Both fields required!");
    return;
  }

  const newQuote = {
    id: Date.now(), 
    text: quoteText,
    category: categoryText
  };

  // Update UI + local storage
  localQuotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(localQuotes));

  // Push to server simulation
  pushLocalQuotesToServer(newQuote);

  // Refresh display
  displayQuotes(localQuotes);

  notifyUser("New quote added + synced to server!");
}

/* --------------------------------------------------
   Notification UI
--------------------------------------------------- */
function notifyUser(message) {
  const box = document.getElementById("notificationBox");
  box.textContent = message;
  box.style.opacity = 1;

  setTimeout(() => {
    box.style.opacity = 0;
  }, 3000);
}

