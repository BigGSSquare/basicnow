// Add this to the beginning of script3.js

// Financial Health Calculator
function calculateFinancialHealth(savingsPercentage) {
  // Cap the financial health score to match the savings percentage
  return Math.min(Math.max(savingsPercentage, 0), 100);
}

function getRecommendationText(healthScore) {
  if (healthScore >= 80) {
    return "Your financial health is excellent! You can consider investing in high-risk stocks for potentially higher returns.";
  } else if (healthScore >= 60) {
    return "Your financial health is good. A balanced portfolio with some high-risk stocks could be suitable for you.";
  } else if (healthScore >= 40) {
    return "Your financial health is moderate. Consider focusing on medium-risk stocks for balanced growth.";
  } else {
    return "Your financial health needs attention. It's recommended to focus on low-risk stocks to build stability.";
  }
}

function getHealthClass(healthScore) {
  if (healthScore >= 80) {
    return "excellent";
  } else if (healthScore >= 60) {
    return "good";
  } else if (healthScore >= 40) {
    return "moderate";
  } else {
    return "attention";
  }
}

function createFinancialHealthBox() {
  // Create the financial health box
  const financialHealthBox = document.createElement("div");
  financialHealthBox.className = "financial-health-box card";

  // Get saved savings percentage or use default
  const savedSavingsPercentage = localStorage.getItem("savingsPercentage");
  const savingsPercentage = savedSavingsPercentage
    ? parseInt(savedSavingsPercentage)
    : 45;

  // Calculate financial health score
  const healthScore = calculateFinancialHealth(savingsPercentage);
  const healthClass = getHealthClass(healthScore);
  const recommendationText = getRecommendationText(healthScore);

  // Create the content
  financialHealthBox.innerHTML = `
    <div class="card-header">
      <h2>Your Financial Health</h2>
      <button id="edit-savings-btn" class="edit-btn">Edit</button>
    </div>
    <div class="card-body">
      <div class="health-score-container">
        <div class="health-score ${healthClass}">
          <span class="score-value">${healthScore}</span>
          <span class="score-label">Health Score</span>
        </div>
        <div class="health-details">
          <div class="savings-info">
            <span class="detail-label">Your Savings Rate:</span>
            <span class="detail-value">${savingsPercentage}%</span>
          </div>
          <p class="recommendation">${recommendationText}</p>
        </div>
      </div>
    </div>
  `;

  return financialHealthBox;
}

function setupFinancialHealthBox() {
  const mainContent = document.querySelector(".main-content");
  const header = mainContent.querySelector("header");

  // Create and insert financial health box after header
  const financialHealthBox = createFinancialHealthBox();

  // Insert after header
  if (header.nextSibling) {
    mainContent.insertBefore(financialHealthBox, header.nextSibling);
  } else {
    mainContent.appendChild(financialHealthBox);
  }

  // Add event listener for edit button
  const editSavingsBtn = document.getElementById("edit-savings-btn");
  editSavingsBtn.addEventListener("click", openEditSavingsModal);
}

function openEditSavingsModal() {
  // Create modal for editing savings percentage
  const savedSavingsPercentage = localStorage.getItem("savingsPercentage");
  const savingsPercentage = savedSavingsPercentage
    ? parseInt(savedSavingsPercentage)
    : 45;

  const modalContainer = document.createElement("div");
  modalContainer.className = "modal-container";
  modalContainer.id = "savings-edit-modal";

  modalContainer.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Update Savings Rate</h2>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Enter your current savings rate as a percentage of your income:</p>
        <div class="input-group">
          <input type="number" id="savings-percentage" min="0" max="100" value="${savingsPercentage}" class="savings-input">
          <span class="input-suffix">%</span>
        </div>
        <div class="slider-container">
          <input type="range" id="savings-slider" min="0" max="100" value="${savingsPercentage}">
          <div class="slider-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="save-savings-btn" class="stock-button view-btn">Save Changes</button>
        <button class="stock-button close-btn">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // Add event listeners
  const closeButtons = modalContainer.querySelectorAll(
    ".close-modal, .close-btn"
  );
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.body.removeChild(modalContainer);
    });
  });

  // Synchronize slider and number input
  const savingsInput = document.getElementById("savings-percentage");
  const savingsSlider = document.getElementById("savings-slider");

  savingsInput.addEventListener("input", () => {
    savingsSlider.value = savingsInput.value;
  });

  savingsSlider.addEventListener("input", () => {
    savingsInput.value = savingsSlider.value;
  });

  // Save button functionality
  const saveButton = document.getElementById("save-savings-btn");
  saveButton.addEventListener("click", () => {
    const newSavingsPercentage = parseInt(savingsInput.value);

    // Validate input
    if (
      isNaN(newSavingsPercentage) ||
      newSavingsPercentage < 0 ||
      newSavingsPercentage > 100
    ) {
      alert("Please enter a valid percentage between 0 and 100");
      return;
    }

    // Save to localStorage
    localStorage.setItem("savingsPercentage", newSavingsPercentage);

    // Update UI
    document.body.removeChild(modalContainer);

    // Remove existing financial health box and create new one with updated value
    const existingBox = document.querySelector(".financial-health-box");
    if (existingBox) {
      existingBox.remove();
    }
    setupFinancialHealthBox();

    // Show notification
    showNotification(`Savings rate updated to ${newSavingsPercentage}%`);
  });
}

// Add to DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function () {
  // Create initial modal (can be done ahead of time)
  createStockDetailsModal();

  // Initialize watchlist buttons to correct state
  initWatchlistButtons();

  // Set up event listeners
  setupWatchlistButtons();
  setupViewButtons();

  // Set up financial health box
  setupFinancialHealthBox();
});

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
  } else {
    notificationMessage.textContent = message;
    notification.classList.remove("hidden");

    setTimeout(() => {
      notification.classList.add("hidden");
    }, duration);
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Create initial modal (can be done ahead of time)
  createStockDetailsModal();

  // Initialize watchlist buttons to correct state
  initWatchlistButtons();

  // Set up event listeners
  setupWatchlistButtons();
  setupViewButtons();
});
