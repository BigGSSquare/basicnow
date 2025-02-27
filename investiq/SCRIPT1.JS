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

// Portfolio Growth Chart
let portfolioChart = null;
let expenseSavingsChart = null;
let investmentBreakdownChart = null;

// Show notification
function showNotification(message, duration = 3000) {
  const notification = document.getElementById("update-notification");
  const notificationMessage = document.getElementById("notification-message");
  notificationMessage.textContent = message;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, duration);
}

// Update the last updated text
function updateLastUpdatedTime() {
  const portfolioLastUpdated = document.getElementById(
    "portfolio-last-updated"
  );
  const now = new Date();
  portfolioLastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Generate dates for the last n months
function generateDates(months) {
  const dates = [];
  const today = new Date();

  for (let i = months; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    dates.push(
      date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    );
  }

  return dates;
}

// Generate random portfolio values with a growth trend
function generatePortfolioData(months, startValue, growthRate) {
  const data = [];
  let currentValue = startValue;

  for (let i = 0; i <= months; i++) {
    // Add some randomness but maintain an overall growth trend
    const randomFactor = 1 + (Math.random() * 0.06 - 0.03); // Random factor between 0.97 and 1.03
    currentValue = currentValue * (1 + growthRate / 12) * randomFactor;
    data.push(Math.round(currentValue * 100) / 100);
  }

  return data;
}

// Initialize Portfolio Growth Chart
function initPortfolioChart(months = 6) {
  const ctx = document.getElementById("portfolioGrowthChart").getContext("2d");
  if (!ctx) {
    console.error("Could not get context for portfolioGrowthChart");
    return;
  }

  const startValue = 45000; // Starting portfolio value
  const growthRate = 0.12; // Annual growth rate

  const labels = generateDates(months);
  const portfolioData = generatePortfolioData(months, startValue, growthRate);

  // Update the portfolio value and growth percentage
  const totalAssetsEl = document.getElementById("total-assets");
  const portfolioGrowthEl = document.getElementById("portfolio-growth");

  if (totalAssetsEl) {
    totalAssetsEl.textContent = `$${portfolioData[
      portfolioData.length - 1
    ].toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (portfolioGrowthEl) {
    const growthPercentage =
      (portfolioData[portfolioData.length - 1] / portfolioData[0] - 1) * 100;
    portfolioGrowthEl.textContent = `${
      growthPercentage >= 0 ? "+" : ""
    }${growthPercentage.toFixed(1)}%`;
    portfolioGrowthEl.className = `stat-value ${
      growthPercentage >= 0 ? "green" : "red"
    }`;
  }

  if (portfolioChart) {
    portfolioChart.destroy();
  }

  portfolioChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Portfolio Value",
          data: portfolioData,
          backgroundColor: "rgba(67, 97, 238, 0.2)",
          borderColor: "rgba(67, 97, 238, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
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
              return `Portfolio Value: $${context.parsed.y.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

// Initialize Expense vs Savings Chart
function initExpenseSavingsChart() {
  const ctx = document.getElementById("expenseSavingsChart");
  if (!ctx) {
    console.error("Could not find expenseSavingsChart");
    return;
  }

  const context = ctx.getContext("2d");
  if (!context) {
    console.error("Could not get context for expenseSavingsChart");
    return;
  }

  if (expenseSavingsChart) {
    expenseSavingsChart.destroy();
  }

  expenseSavingsChart = new Chart(context, {
    type: "doughnut",
    data: {
      labels: ["Expenses", "Savings", "Others"],
      datasets: [
        {
          data: [52, 32, 16],
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(76, 201, 240, 0.8)",
          ],
          borderColor: [
            "rgba(239, 68, 68, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(76, 201, 240, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// Initialize Investment Breakdown Chart
function initInvestmentBreakdownChart() {
  const ctx = document.getElementById("investmentBreakdownChart");
  if (!ctx) {
    console.error("Could not find investmentBreakdownChart");
    return;
  }

  const context = ctx.getContext("2d");
  if (!context) {
    console.error("Could not get context for investmentBreakdownChart");
    return;
  }

  if (investmentBreakdownChart) {
    investmentBreakdownChart.destroy();
  }

  investmentBreakdownChart = new Chart(context, {
    type: "doughnut",
    data: {
      labels: ["SIP", "Mutual Funds", "Stocks"],
      datasets: [
        {
          data: [45, 35, 20],
          backgroundColor: [
            "rgba(67, 97, 238, 0.8)",
            "rgba(96, 165, 250, 0.8)",
            "rgba(76, 201, 240, 0.8)",
          ],
          borderColor: [
            "rgba(67, 97, 238, 1)",
            "rgba(96, 165, 250, 1)",
            "rgba(76, 201, 240, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// Add transaction to the list
function setupTransactionForm() {
  const form = document.getElementById("transaction-form");
  if (!form) {
    console.error("Could not find transaction-form");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const amount = document.getElementById("transaction-amount").value;
    const type = document.getElementById("transaction-type").value;
    const category = document.getElementById("transaction-category").value;
    const dateInput = document.getElementById("transaction-date").value;

    const date = new Date(dateInput);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const transactionsList = document.getElementById("transactions-list");
    if (!transactionsList) {
      console.error("Could not find transactions-list");
      return;
    }

    const newRow = document.createElement("tr");
    newRow.style.opacity = "0";
    newRow.style.transform = "translateY(20px)";

    const categoryElement = document.getElementById("transaction-category");
    if (!categoryElement) {
      console.error("Could not find transaction-category");
      return;
    }

    newRow.innerHTML = `
    <td>${formattedDate}</td>
    <td>${categoryElement.options[categoryElement.selectedIndex].text}</td>
    <td class="${type === "income" ? "green" : "red"}">${
      type === "income" ? "Income" : "Expense"
    }</td>
    <td>$${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}</td>
  `;

    transactionsList.insertBefore(newRow, transactionsList.firstChild);

    // Animate the row appearing
    setTimeout(() => {
      newRow.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      newRow.style.opacity = "1";
      newRow.style.transform = "translateY(0)";
    }, 50);

    showNotification("Transaction added successfully!");
    this.reset();

    // Set today's date as default for the next entry
    const today = new Date().toISOString().split("T")[0];
    const transactionDateElement = document.getElementById("transaction-date");
    if (transactionDateElement) {
      transactionDateElement.value = today;
    }
  });
}

// Time filter for portfolio chart
function setupTimeButtons() {
  const timeButtons = document.querySelectorAll(".time-btn");
  if (timeButtons.length === 0) {
    console.error("Could not find time-btn elements");
    return;
  }

  timeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document
        .querySelectorAll(".time-btn")
        .forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const months = parseInt(this.getAttribute("data-months"));
      initPortfolioChart(months);

      // Animate the chart section
      const chartSection = document.querySelector(
        ".portfolio-overview-section"
      );
      if (chartSection) {
        chartSection.classList.add("highlight");
        setTimeout(() => {
          chartSection.classList.remove("highlight");
        }, 1000);
      }
    });
  });
}

// Initialize on page load with error handling
function initDashboard() {
  // Update UI based on theme
  updateToggleButton(document.body.classList.contains("dark-mode"));

  // Set today's date as default for transaction date input
  const today = new Date().toISOString().split("T")[0];
  const transactionDateElement = document.getElementById("transaction-date");
  if (transactionDateElement) {
    transactionDateElement.value = today;
  }

  try {
    // Initialize all charts
    initPortfolioChart(6); // Default 6 months
    initExpenseSavingsChart();
    initInvestmentBreakdownChart();

    // Setup event listeners
    setupTransactionForm();
    setupTimeButtons();

    updateLastUpdatedTime();
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
}

// Add dashboard style
function addDashboardStyle() {
  const existingStyle = document.getElementById("dashboard-style");
  if (existingStyle) {
    return;
  }

  const style = document.createElement("style");
  style.id = "dashboard-style";
  style.textContent = `
  .time-filter {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
    padding-bottom: 15px;
  }
  
  .time-btn {
    background-color: transparent;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 20px;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .time-btn:hover {
    background-color: rgba(67, 97, 238, 0.1);
  }
  
  .time-btn.active {
    background-color: var(--primary-color, #4361ee);
    color: white;
  }
  
  .transaction-form {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }
  
  .form-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .form-group label {
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: var(--text-color, #333);
  }
  
  .form-group input,
  .form-group select {
    padding: 8px 12px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    background-color: var(--card-background, white);
    color: var(--text-color, #333);
  }
  
  .add-transaction-btn {
    background-color: var(--primary-color, #4361ee);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .add-transaction-btn:hover {
    background-color: rgba(67, 97, 238, 0.9);
  }
  
  .recent-transactions {
    padding: 15px 20px 5px;
  }
  
  .recent-transactions h3 {
    margin-bottom: 10px;
    font-size: 1.1rem;
  }
  
  .chart-title {
    text-align: center;
    font-size: 1rem;
    margin-bottom: 10px;
    color: var(--text-color, #333);
  }
  
  .allocation-summary {
    padding: 0 20px 15px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }
  
  .allocation-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .allocation-label {
    flex: 0 0 80px;
    font-size: 0.9rem;
  }
  
  .allocation-bar {
    flex: 1;
    height: 10px;
    background-color: var(--border-color, #e0e0e0);
    border-radius: 5px;
    overflow: hidden;
    margin: 0 10px;
  }
  
  .allocation-progress {
    height: 100%;
    border-radius: 5px;
  }
  
  .allocation-value {
    flex: 0 0 40px;
    text-align: right;
    font-weight: 500;
  }
  
  .investment-breakdown {
    padding: 15px 20px;
  }
  
  .investment-breakdown h3 {
    margin-bottom: 15px;
    font-size: 1.1rem;
  }
  
  .investment-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .investment-item {
    display: flex;
    flex-direction: column;
  }
  
  .investment-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  
  .investment-name {
    font-weight: 500;
  }
  
  .investment-value {
    font-weight: 600;
  }
  
  .investment-bar {
    height: 10px;
    background-color: var(--border-color, #e0e0e0);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 5px;
  }
  
  .investment-progress {
    height: 100%;
    border-radius: 5px;
  }
  
  .investment-percentage {
    align-self: flex-end;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  /* Add highlight animation for chart refresh */
  .highlight {
    animation: highlight-pulse 1s ease;
  }
  
  @keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 rgba(67, 97, 238, 0); }
    50% { box-shadow: 0 0 15px rgba(67, 97, 238, 0.5); }
    100% { box-shadow: 0 0 0 rgba(67, 97, 238, 0); }
  }
  
  @media (max-width: 768px) {
    .chart-container {
      flex-direction: column;
      align-items: center;
    }
    
    .chart-container > div {
      width: 100% !important;
      margin-bottom: 20px;
    }
    
    .form-row {
      flex-direction: column;
      gap: 10px;
    }
  }
  
  /* Add CSS variables for theme colors */
  :root {
    --primary-color: #4361ee;
    --danger-color: #ef4444;
    --success-color: #10b981;
    --secondary-color: #4cc9f0;
    --accent-color: #60a5fa;
    --border-color: #e0e0e0;
    --text-color: #333;
    --card-background: white;
  }
  
  .dark-mode {
    --border-color: #333;
    --text-color: #e0e0e0;
    --card-background: #1f1f1f;
  }
  
  /* Add classes for transaction types */
  .green {
    color: var(--success-color, #10b981);
  }
  
  .red {
    color: var(--danger-color, #ef4444);
  }
  
  /* Add portfolio summary styling */
  .portfolio-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    padding: 0 10px;
  }
  
  .portfolio-stat {
    flex: 1;
    min-width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
  }
  
  .stat-value {
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .last-updated {
    font-size: 0.8rem;
    color: #666;
  }
  `;

  document.head.appendChild(style);
}

// Wait for DOM to be fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    addDashboardStyle();
    initDashboard();
  });
} else {
  addDashboardStyle();
  initDashboard();
}

// Export the functions for potential external use
window.dashboardFunctions = {
  initPortfolioChart,
  initExpenseSavingsChart,
  initInvestmentBreakdownChart,
  showNotification,
  updateLastUpdatedTime,
};
