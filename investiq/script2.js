// 🌙 Dark Mode Toggle
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

// Stock Watchlist Management
const stockForm = document.getElementById("stock-form");
const watchlist = document.getElementById("watchlist");
const lastUpdated = document.getElementById("last-updated");
const notification = document.getElementById("update-notification");
const notificationMessage = document.getElementById("notification-message");
const API_KEY = "Bst8a_EQ9r6nAF4cAk1cn97ZKmuk3F1c"; // Replace with your API key

// Update the last updated text
function updateLastUpdatedTime() {
  const now = new Date();
  lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Show notification
function showNotification(message, duration = 3000) {
  notificationMessage.textContent = message;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, duration);
}

// Fetch Real-time Stock Price
async function fetchStockPrice(symbol) {
  const API_URL = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${API_KEY}`;
  try {
    console.log("Fetching data for:", symbol);
    const response = await fetch(API_URL);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const latest = data.results[0];
      return {
        price: parseFloat(latest.c).toFixed(2),
        change: (((latest.c - latest.o) / latest.o) * 100).toFixed(2),
        prevClose: parseFloat(latest.o).toFixed(2),
      };
    }
    showNotification("Stock not found or invalid response", 3000);
    return null;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    showNotification("Error fetching stock data: " + error.message, 5000);
    return null;
  }
}

// Add Stock to Watchlist with animation
stockForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const symbolInput = document.getElementById("stock-symbol");
  const symbol = symbolInput.value.trim().toUpperCase();

  if (!symbol) {
    showNotification("Please enter a valid stock symbol");
    return;
  }

  // Show loading state
  const submitButton = this.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.innerHTML = '<span class="loading">Loading...</span>';
  submitButton.disabled = true;

  const stockData = await fetchStockPrice(symbol);
  submitButton.textContent = originalText;
  submitButton.disabled = false;

  if (!stockData) return;

  if (document.getElementById(symbol)) {
    showNotification("Stock already in watchlist!");
    return;
  }

  addStockToTable(symbol, stockData);
  updateLastUpdatedTime();
  stockForm.reset();
  symbolInput.focus();
});

// Function to add stock row with animation
function addStockToTable(symbol, stockData) {
  const row = document.createElement("tr");
  row.id = symbol;
  row.style.opacity = "0";
  row.style.transform = "translateY(20px)";
  row.innerHTML = `
    <td class="stock-symbol">${symbol}</td>
    <td class="price">$${stockData.price}</td>
    <td class="change ${parseFloat(stockData.change) >= 0 ? "green" : "red"}">
      ${stockData.change >= 0 ? "+" : ""}${stockData.change}%
    </td>
    <td>
      <button class="delete-btn">Remove</button>
    </td>
  `;

  row.querySelector(".delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    // Animate removal
    row.style.opacity = "0";
    row.style.transform = "translateX(20px)";

    setTimeout(() => {
      row.remove();
      if (document.querySelectorAll("#watchlist tr").length === 0) {
        document.querySelector(".info-message").style.display = "block";
      }
    }, 300);
  });

  // Add row click event for detail view (expansion)
  row.addEventListener("click", function () {
    const isExpanded = row.classList.contains("expanded");

    // Reset all rows
    document.querySelectorAll("#watchlist tr").forEach((r) => {
      r.classList.remove("expanded");
      const detailRow = document.getElementById(`detail-${r.id}`);
      if (detailRow) detailRow.remove();
    });

    // If not already expanded, create detail view
    if (!isExpanded) {
      row.classList.add("expanded");
      const detailRow = document.createElement("tr");
      detailRow.id = `detail-${symbol}`;
      detailRow.innerHTML = `
        <td colspan="4" class="stock-details">
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Previous Close:</span>
              <span class="detail-value">$${stockData.prevClose}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Current:</span>
              <span class="detail-value">$${stockData.price}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Change:</span>
              <span class="detail-value ${
                parseFloat(stockData.change) >= 0 ? "green" : "red"
              }">
                ${stockData.change}%
              </span>
            </div>
          </div>
        </td>
      `;
      watchlist.insertBefore(detailRow, row.nextSibling);
    }
  });

  watchlist.appendChild(row);
  document.querySelector(".info-message").style.display = "none";

  // Animate the row appearing with a slight delay
  setTimeout(() => {
    row.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    row.style.opacity = "1";
    row.style.transform = "translateY(0)";
  }, 50);
}

// Update Stock Prices Every 60 Seconds
setInterval(async () => {
  const rows = document.querySelectorAll("#watchlist tr:not([id^='detail-'])");
  if (rows.length === 0) return;

  showNotification("Updating prices...");

  for (const row of rows) {
    const symbol = row.id;
    const stockData = await fetchStockPrice(symbol);
    if (stockData) {
      const priceEl = row.querySelector(".price");
      const changeEl = row.querySelector(".change");

      // Animate price change
      priceEl.classList.add("updating");
      changeEl.classList.add("updating");

      // Update with new values
      setTimeout(() => {
        priceEl.textContent = `$${stockData.price}`;
        changeEl.textContent = `${stockData.change >= 0 ? "+" : ""}${
          stockData.change
        }%`;
        changeEl.className = `change ${
          parseFloat(stockData.change) >= 0 ? "green" : "red"
        }`;

        // Remove animation class
        priceEl.classList.remove("updating");
        changeEl.classList.remove("updating");
      }, 300);

      // Update detail view if expanded
      const detailRow = document.getElementById(`detail-${symbol}`);
      if (detailRow) {
        const detailVals = detailRow.querySelectorAll(".detail-value");
        detailVals[1].textContent = `$${stockData.price}`;
        detailVals[2].textContent = `${stockData.change}%`;
        detailVals[2].className = `detail-value ${
          parseFloat(stockData.change) >= 0 ? "green" : "red"
        }`;
      }
    }
  }

  updateLastUpdatedTime();
}, 60000);

// Investment Calculator
const investmentForm = document.getElementById("investment-form");
let growthChart = null;

investmentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const initialInvestment = parseFloat(
    document.getElementById("initial-investment").value
  );
  const monthlyContribution = parseFloat(
    document.getElementById("monthly-contribution").value
  );
  const interestRate =
    parseFloat(document.getElementById("interest-rate").value) / 100;
  const years = parseInt(document.getElementById("years").value);

  calculateInvestment(
    initialInvestment,
    monthlyContribution,
    interestRate,
    years
  );
});

function calculateInvestment(
  initialInvestment,
  monthlyContribution,
  annualRate,
  years
) {
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;

  let balance = initialInvestment;
  const labels = [];
  const contributionData = [];
  const interestData = [];
  const totalBalanceData = [];

  let totalContributions = initialInvestment;
  let totalInterest = 0;

  // Calculate for each month
  for (let month = 0; month <= totalMonths; month++) {
    if (month > 0) {
      const interest = balance * monthlyRate;
      balance += interest + monthlyContribution;
      totalContributions += monthlyContribution;
      totalInterest += interest;
    }

    // Record data points (only for years or first/last month)
    if (month % 12 === 0 || month === totalMonths) {
      const yearLabel = Math.floor(month / 12);
      labels.push(yearLabel === 0 ? "Start" : `Year ${yearLabel}`);
      contributionData.push(totalContributions);
      interestData.push(totalInterest);
      totalBalanceData.push(balance);
    }
  }

  updateChart(labels, contributionData, interestData, totalBalanceData);
}

function updateChart(labels, contributionData, interestData, totalBalanceData) {
  const ctx = document.getElementById("growthChart").getContext("2d");

  if (growthChart !== null) {
    growthChart.destroy();
  }

  growthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Balance",
          data: totalBalanceData,
          backgroundColor: "rgba(67, 97, 238, 0.2)",
          borderColor: "rgba(67, 97, 238, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
        {
          label: "Contributions",
          data: contributionData,
          backgroundColor: "rgba(76, 201, 240, 0.2)",
          borderColor: "rgba(76, 201, 240, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                context.dataset.label +
                ": $" +
                context.raw.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              );
            },
          },
        },
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Animation for chart section
  const chartSection = document.querySelector(".chart-section");
  chartSection.classList.add("highlight");
  setTimeout(() => {
    chartSection.classList.remove("highlight");
  }, 1000);
}

// Add sample stock data on page load
window.addEventListener("load", function () {
  // Update UI based on theme
  updateToggleButton(document.body.classList.contains("dark-mode"));

  // Load sample stocks
  if (document.querySelectorAll("#watchlist tr").length === 0) {
    ["AAPL", "GOOGL", "TSLA"].forEach(async (symbol, index) => {
      // Add slight delay between each fetch for better visual
      setTimeout(async () => {
        const stockData = await fetchStockPrice(symbol);
        if (stockData) addStockToTable(symbol, stockData);
      }, index * 300);
    });
  }

  // Initialize chart with default values
  calculateInvestment(1000, 200, 0.07, 10);
});

// Additional CSS for animations
const style = document.createElement("style");
style.textContent = `
  .updating {
    animation: flash 0.5s ease;
  }
  
  @keyframes flash {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  .loading {
    display: inline-block;
    position: relative;
  }
  
  .loading:after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
    display: inline-block;
    width: 0;
    overflow: hidden;
  }
  
  @keyframes dots {
    0%, 20% { width: 0; }
    40% { width: 1ch; }
    60% { width: 2ch; }
    80%, 100% { width: 3ch; }
  }
  
  .stock-details {
    background: rgba(0, 0, 0, 0.02);
    padding: 15px !important;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
  }
  
  .detail-label {
    font-size: 0.85rem;
    color: #888;
  }
  
  .detail-value {
    font-weight: 600;
    font-size: 1rem;
  }
  
  tr.expanded {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  .dark-mode tr.expanded {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .highlight {
    animation: highlight-pulse 1s ease;
  }
  
  @keyframes highlight-pulse {
    0% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
    50% { box-shadow: 0 4px 20px rgba(67, 97, 238, 0.4); }
    100% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
  }
  
  .dark-mode .highlight {
    animation: highlight-pulse-dark 1s ease;
  }
  
  @keyframes highlight-pulse-dark {
    0% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 4px 25px rgba(76, 201, 240, 0.4); }
    100% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
  }
`;

document.head.appendChild(style);
