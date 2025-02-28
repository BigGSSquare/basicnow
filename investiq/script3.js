// API Configuration
const API_KEY = "Bst8a_EQ9r6nAF4cAk1cn97ZKmuk3F1c";
const API_BASE_URL = "https://api.polygon.io/v2/aggs/ticker";

// Stock tickers to fetch
const stockTickers = [
  // High Returns, Low Risk
  "MSFT",
  "JNJ",
  "PG",
  // Medium Returns
  "NKE",
  "V",
  "ADBE",
  // High Risk, High Potential
  "TSLA",
  "NVDA",
  "PLTR",
];

// Dark Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
const toggleIcon = document.querySelector(".toggle-icon");
const toggleText = document.querySelector(".toggle-text");

// Check for saved theme preference or use system preference
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const currentTheme = localStorage.getItem("theme");

if (currentTheme === "dark" || (!currentTheme && prefersDarkScheme.matches)) {
  document.body.classList.add("dark-mode");
  updateToggleButton(true);
}

function updateToggleButton(isDark) {
  toggleIcon.textContent = isDark ? "☀️" : "🌙";
  toggleText.textContent = isDark ? "Light Mode" : "Dark Mode";
}

themeToggle.addEventListener("click", function () {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  updateToggleButton(isDarkMode);
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

// Fetch stock data
async function fetchStockData(symbol) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${symbol}/prev?adjusted=true&apiKey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

// Fetch all stocks data
async function fetchAllStocksData() {
  const loadingNotification = showNotification(
    "Fetching latest stock data...",
    10000
  );

  try {
    const promises = stockTickers.map((ticker) => fetchStockData(ticker));
    const results = await Promise.allSettled(promises);

    // Process results
    results.forEach((result, index) => {
      if (
        result.status === "fulfilled" &&
        result.value &&
        result.value.results
      ) {
        updateStockCard(stockTickers[index], result.value.results[0]);
      }
    });

    // Hide loading notification
    loadingNotification.classList.add("hidden");
    showNotification("Stock data updated successfully!", 3000);
  } catch (error) {
    console.error("Error fetching all stocks data:", error);
    loadingNotification.classList.add("hidden");
    showNotification(
      "Error updating stock data. Please try again later.",
      3000
    );
  }
}

// Update stock card with the fetched data
function updateStockCard(ticker, stockData) {
  const stockCards = document.querySelectorAll(".stock-card");

  // Find the card with matching ticker
  for (const card of stockCards) {
    const cardTicker = card.querySelector(".stock-ticker").textContent;

    if (cardTicker === ticker) {
      // Update price
      const currentPrice = card.querySelector(".current-price");
      const newPrice = stockData.c.toFixed(2);
      currentPrice.textContent = `$${newPrice}`;

      // Calculate price change percentage
      const priceChangePercent = (
        ((stockData.c - stockData.o) / stockData.o) *
        100
      ).toFixed(1);
      const isPositive = priceChangePercent >= 0;

      // Update price change element
      const priceChange = card.querySelector(".price-change");
      priceChange.textContent = `${
        isPositive ? "+" : ""
      }${priceChangePercent}% ${isPositive ? "⬆" : "⬇"}`;
      priceChange.className = `price-change ${
        isPositive ? "positive" : "negative"
      }`;

      // Update 52-week range if available (using high and low as approximation)
      const rangeElement = card.querySelector(
        ".detail-item:nth-child(4) .detail-value"
      );
      if (stockData.h && stockData.l) {
        // Approximating 52W range with yesterday's high and low
        // In a real app, you'd want to fetch the actual 52W range separately
        const lowValue = (stockData.l * 0.85).toFixed(0); // Simulating a lower value for range
        const highValue = (stockData.h * 1.05).toFixed(0); // Simulating a higher value for range
        rangeElement.textContent = `$${lowValue} - $${highValue}`;
      }

      break;
    }
  }
}

// Create a refresh button
function createRefreshButton() {
  const header = document.querySelector(".main-content header");

  // Create refresh button if it doesn't exist
  if (!document.getElementById("refresh-data-btn")) {
    const refreshButton = document.createElement("button");
    refreshButton.id = "refresh-data-btn";
    refreshButton.className = "refresh-button";
    refreshButton.innerHTML = "↻ Refresh Data";

    refreshButton.addEventListener("click", () => {
      fetchAllStocksData();
    });

    header.appendChild(refreshButton);
  }
}

// Watchlist functionality
function loadWatchlist() {
  try {
    const savedWatchlist = localStorage.getItem("watchlist");
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  } catch (error) {
    console.error("Error loading watchlist:", error);
    return [];
  }
}

function saveWatchlist(watchlist) {
  try {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  } catch (error) {
    console.error("Error saving watchlist:", error);
  }
}

function addToWatchlist(stockInfo) {
  const watchlist = loadWatchlist();

  // Check if stock is already in watchlist
  const existingIndex = watchlist.findIndex(
    (item) => item.ticker === stockInfo.ticker
  );

  if (existingIndex === -1) {
    // Add to watchlist if not already present
    watchlist.push(stockInfo);
    saveWatchlist(watchlist);
    return true;
  }
  return false;
}

function removeFromWatchlist(ticker) {
  const watchlist = loadWatchlist();
  const initialLength = watchlist.length;

  const filteredWatchlist = watchlist.filter((item) => item.ticker !== ticker);

  if (filteredWatchlist.length !== initialLength) {
    saveWatchlist(filteredWatchlist);
    return true;
  }
  return false;
}

function isInWatchlist(ticker) {
  const watchlist = loadWatchlist();
  return watchlist.some((item) => item.ticker === ticker);
}

// Initialize watchlist button states
function initWatchlistButtons() {
  const watchlistButtons = document.querySelectorAll(".watchlist-btn");

  watchlistButtons.forEach((button) => {
    const stockCard = button.closest(".stock-card");
    const ticker = stockCard.querySelector(".stock-ticker").textContent;

    // Set initial button text based on watchlist status
    if (isInWatchlist(ticker)) {
      button.textContent = "Remove from Watchlist";
      button.classList.add("in-watchlist");
    } else {
      button.textContent = "Add to Watchlist";
      button.classList.remove("in-watchlist");
    }
  });
}

// Add event listeners for watchlist buttons
function setupWatchlistButtons() {
  const watchlistButtons = document.querySelectorAll(".watchlist-btn");

  watchlistButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const stockCard = this.closest(".stock-card");
      const stockName = stockCard.querySelector(".stock-name").textContent;
      const ticker = stockCard.querySelector(".stock-ticker").textContent;
      const currentPrice =
        stockCard.querySelector(".current-price").textContent;
      const priceChange = stockCard.querySelector(".price-change").textContent;

      const stockInfo = {
        name: stockName,
        ticker: ticker,
        price: currentPrice,
        change: priceChange,
        addedOn: new Date().toISOString(),
      };

      if (this.textContent === "Add to Watchlist") {
        if (addToWatchlist(stockInfo)) {
          this.textContent = "Remove from Watchlist";
          this.classList.add("in-watchlist");
          showNotification(`${stockName} added to watchlist!`);
        }
      } else {
        if (removeFromWatchlist(ticker)) {
          this.textContent = "Add to Watchlist";
          this.classList.remove("in-watchlist");
          showNotification(`${stockName} removed from watchlist!`);
        }
      }
    });
  });
}

// Stock details functionality
function createStockDetailsModal() {
  // Create modal container if it doesn't exist
  if (!document.getElementById("stock-details-modal")) {
    const modalContainer = document.createElement("div");
    modalContainer.id = "stock-details-modal";
    modalContainer.className = "modal-container hidden";

    modalContainer.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modal-stock-name">Stock Details</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="stock-info">
            <div class="stock-price-large">
              <span id="modal-stock-price">$0.00</span>
              <span id="modal-stock-change" class="price-change">0.00%</span>
            </div>
            <div class="stock-tags" id="modal-stock-tags"></div>
          </div>
          <div class="stock-metrics">
            <div class="metric-item">
              <div class="metric-label">Market Cap</div>
              <div class="metric-value" id="modal-market-cap">-</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Dividend Yield</div>
              <div class="metric-value" id="modal-dividend">-</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">P/E Ratio</div>
              <div class="metric-value" id="modal-pe">-</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">52W Range</div>
              <div class="metric-value" id="modal-range">-</div>
            </div>
          </div>
          <div class="additional-info">
            <h3>Performance History</h3>
            <p>Detailed performance metrics and history will appear here.</p>
            <h3>Analyst Recommendations</h3>
            <p>Analyst ratings and forecasts will appear here.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button id="modal-watchlist-btn" class="stock-button">Add to Watchlist</button>
          <button class="stock-button close-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalContainer);

    // Add event listeners for modal
    const closeButtons = modalContainer.querySelectorAll(
      ".close-modal, .close-btn"
    );
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", closeStockDetailsModal);
    });

    // Close modal when clicking outside
    modalContainer.addEventListener("click", function (event) {
      if (event.target === modalContainer) {
        closeStockDetailsModal();
      }
    });

    // Add watchlist functionality to modal button
    const modalWatchlistBtn = document.getElementById("modal-watchlist-btn");
    modalWatchlistBtn.addEventListener("click", function () {
      const stockName = document.getElementById("modal-stock-name").textContent;
      const ticker = stockName.match(/\(([^)]+)\)/)[1];

      if (this.textContent === "Add to Watchlist") {
        const stockInfo = {
          name: stockName.split(" (")[0],
          ticker: ticker,
          price: document.getElementById("modal-stock-price").textContent,
          change: document.getElementById("modal-stock-change").textContent,
          addedOn: new Date().toISOString(),
        };

        if (addToWatchlist(stockInfo)) {
          this.textContent = "Remove from Watchlist";
          this.classList.add("in-watchlist");
          updateWatchlistButtonsForTicker(ticker, true);
          showNotification(`${stockInfo.name} added to watchlist!`);
        }
      } else {
        if (removeFromWatchlist(ticker)) {
          this.textContent = "Add to Watchlist";
          this.classList.remove("in-watchlist");
          updateWatchlistButtonsForTicker(ticker, false);
          showNotification(
            `${stockName.split(" (")[0]} removed from watchlist!`
          );
        }
      }
    });
  }
}

function updateWatchlistButtonsForTicker(ticker, isInWatchlist) {
  const allWatchlistButtons = document.querySelectorAll(".watchlist-btn");

  allWatchlistButtons.forEach((button) => {
    const stockCard = button.closest(".stock-card");
    if (!stockCard) return;

    const cardTicker = stockCard.querySelector(".stock-ticker").textContent;
    if (cardTicker === ticker) {
      if (isInWatchlist) {
        button.textContent = "Remove from Watchlist";
        button.classList.add("in-watchlist");
      } else {
        button.textContent = "Add to Watchlist";
        button.classList.remove("in-watchlist");
      }
    }
  });
}

function openStockDetailsModal(stockCard) {
  createStockDetailsModal();

  const modal = document.getElementById("stock-details-modal");
  const stockName = stockCard.querySelector(".stock-name").textContent;
  const ticker = stockCard.querySelector(".stock-ticker").textContent;
  const price = stockCard.querySelector(".current-price").textContent;
  const change = stockCard.querySelector(".price-change").textContent;
  const tags = stockCard.querySelector(".stock-tags").innerHTML;

  // Get detailed metrics
  const marketCap = stockCard.querySelector(
    ".detail-item:nth-child(1) .detail-value"
  ).textContent;
  const dividend = stockCard.querySelector(
    ".detail-item:nth-child(2) .detail-value"
  ).textContent;
  const pe = stockCard.querySelector(
    ".detail-item:nth-child(3) .detail-value"
  ).textContent;
  const range = stockCard.querySelector(
    ".detail-item:nth-child(4) .detail-value"
  ).textContent;

  // Update modal content
  document.getElementById(
    "modal-stock-name"
  ).textContent = `${stockName} (${ticker})`;
  document.getElementById("modal-stock-price").textContent = price;

  const modalChange = document.getElementById("modal-stock-change");
  modalChange.textContent = change;
  modalChange.className = "price-change";
  modalChange.classList.add(change.includes("+") ? "positive" : "negative");

  document.getElementById("modal-stock-tags").innerHTML = tags;
  document.getElementById("modal-market-cap").textContent = marketCap;
  document.getElementById("modal-dividend").textContent = dividend;
  document.getElementById("modal-pe").textContent = pe;
  document.getElementById("modal-range").textContent = range;

  // Update watchlist button state
  const modalWatchlistBtn = document.getElementById("modal-watchlist-btn");
  if (isInWatchlist(ticker)) {
    modalWatchlistBtn.textContent = "Remove from Watchlist";
    modalWatchlistBtn.classList.add("in-watchlist");
  } else {
    modalWatchlistBtn.textContent = "Add to Watchlist";
    modalWatchlistBtn.classList.remove("in-watchlist");
  }

  // Show modal
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function closeStockDetailsModal() {
  const modal = document.getElementById("stock-details-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = ""; // Restore scrolling
  }
}

// Add event listeners for view buttons
function setupViewButtons() {
  const viewButtons = document.querySelectorAll(".view-btn");

  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const stockCard = this.closest(".stock-card");
      const stockName = stockCard.querySelector(".stock-name").textContent;
      const stockTicker = stockCard.querySelector(".stock-ticker").textContent;

      showNotification(`Viewing details for ${stockName} (${stockTicker})`);
      openStockDetailsModal(stockCard);
    });
  });
}

// Show notification
function showNotification(message, duration = 3000) {
  const notification = document.getElementById("update-notification");
  const notificationMessage = document.getElementById("notification-message");

  if (!notification) {
    const newNotification = document.createElement("div");
    newNotification.id = "update-notification";
    newNotification.className = "notification";

    const messageSpan = document.createElement("span");
    messageSpan.id = "notification-message";
    messageSpan.textContent = message;

    newNotification.appendChild(messageSpan);
    document.body.appendChild(newNotification);

    setTimeout(() => {
      newNotification.classList.add("hidden");
    }, duration);

    return newNotification;
  } else {
    notificationMessage.textContent = message;
    notification.classList.remove("hidden");

    setTimeout(() => {
      notification.classList.add("hidden");
    }, duration);

    return notification;
  }
}

// Set up auto refresh (every 5 minutes)
function setupAutoRefresh() {
  // Initial fetch
  fetchAllStocksData();

  // Refresh every 5 minutes (300000 ms)
  setInterval(() => {
    fetchAllStocksData();
  }, 300000);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Create initial modal (can be done ahead of time)
  createStockDetailsModal();

  // Add refresh button to UI
  createRefreshButton();

  // Initialize watchlist buttons to correct state
  initWatchlistButtons();

  // Set up event listeners
  setupWatchlistButtons();
  setupViewButtons();

  // Start auto-refresh for stock data
  setupAutoRefresh();
});
