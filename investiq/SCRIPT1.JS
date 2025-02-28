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

// Dashboard Data Store
const dashboardData = {
  // Store all transactions
  transactions: [],

  // Initial portfolio starting value
  initialPortfolioValue: 45000,

  // Current portfolio value (will be calculated)
  currentPortfolioValue: 45000,

  // Time period for portfolio chart (months)
  portfolioMonths: 6,

  // Add a transaction and update all charts
  addTransaction(transaction) {
    // Add transaction to the beginning of the array (newest first)
    this.transactions.unshift(transaction);

    // Save to localStorage
    this.saveTransactions();

    // Update portfolio value
    if (transaction.type === "income") {
      this.currentPortfolioValue += parseFloat(transaction.amount);
    } else {
      this.currentPortfolioValue -= parseFloat(transaction.amount);
    }

    // Update all charts
    this.updateAllCharts();
  },

  // Remove a transaction and update all charts
  removeTransaction(index) {
    // Get the transaction to be removed
    const transaction = this.transactions[index];

    // Remove transaction
    this.transactions.splice(index, 1);

    // Save to localStorage
    this.saveTransactions();

    // Update portfolio value
    if (transaction.type === "income") {
      this.currentPortfolioValue -= parseFloat(transaction.amount);
    } else {
      this.currentPortfolioValue += parseFloat(transaction.amount);
    }

    // Update all charts
    this.updateAllCharts();
  },

  // Calculate expense and savings data
  calculateExpenseSavingsData() {
    // Calculate totals by category
    const totals = {
      expense: 0,
      income: 0,
      categories: {},
    };

    this.transactions.forEach((transaction) => {
      // Track totals by transaction type
      if (transaction.type === "expense") {
        totals.expense += parseFloat(transaction.amount);
      } else {
        totals.income += parseFloat(transaction.amount);
      }

      // Track totals by category
      if (!totals.categories[transaction.category]) {
        totals.categories[transaction.category] = 0;
      }
      totals.categories[transaction.category] += parseFloat(transaction.amount);
    });

    // Calculate savings
    const savings = totals.income - totals.expense;
    const savings_percentage =
      totals.income > 0 ? (savings / totals.income) * 100 : 0;
    const expense_percentage =
      totals.income > 0 ? (totals.expense / totals.income) * 100 : 0;

    // Include others for miscellaneous expenses (if any)
    const others_percentage = Math.max(
      0,
      100 - expense_percentage - savings_percentage
    );

    return {
      expense: totals.expense,
      income: totals.income,
      savings: savings,
      expense_percentage: expense_percentage,
      savings_percentage: savings_percentage,
      others_percentage: others_percentage,
      categories: totals.categories,
    };
  },

  // Calculate investment breakdown data
  calculateInvestmentBreakdown() {
    // Filter transactions by investment categories
    const investmentCategories = ["SIP", "Mutual Funds", "Stocks"];
    const investmentData = {};

    investmentCategories.forEach((category) => {
      investmentData[category] = 0;
    });

    // Count only income transactions for investments
    this.transactions.forEach((transaction) => {
      if (
        transaction.type === "income" &&
        investmentCategories.includes(transaction.category)
      ) {
        investmentData[transaction.category] += parseFloat(transaction.amount);
      }
    });

    // Calculate totals
    const totalInvestment = Object.values(investmentData).reduce(
      (a, b) => a + b,
      0
    );

    // Convert to percentages
    const result = {};
    if (totalInvestment > 0) {
      investmentCategories.forEach((category) => {
        result[category] = (investmentData[category] / totalInvestment) * 100;
      });
    } else {
      // If no investment data, use default values
      result["SIP"] = 45;
      result["Mutual Funds"] = 35;
      result["Stocks"] = 20;
    }

    return {
      values: Object.values(result),
      total: totalInvestment,
    };
  },

  // Generate historical portfolio data
  generatePortfolioHistory() {
    const months = this.portfolioMonths;
    const dates = generateDates(months);

    // Start with initial value
    let initialPortfolioValue = this.initialPortfolioValue;

    // Generate portfolio values
    const portfolioData = [initialPortfolioValue];

    // Generate random historical data with growth trend (except for the last point)
    for (let i = 1; i < months; i++) {
      // Simulate monthly growth with some randomness
      const growthRate = 0.12; // Annual growth rate
      const randomFactor = 1 + (Math.random() * 0.06 - 0.03); // Random factor between 0.97 and 1.03
      initialPortfolioValue =
        initialPortfolioValue * (1 + growthRate / 12) * randomFactor;
      portfolioData.push(Math.round(initialPortfolioValue * 100) / 100);
    }

    // Add the current actual portfolio value as the last point
    portfolioData.push(this.currentPortfolioValue);

    return {
      labels: dates,
      data: portfolioData,
    };
  },

  // Update all charts and UI
  updateAllCharts() {
    // Update portfolio chart
    updatePortfolioChart();

    // Update expense vs savings chart
    updateExpenseSavingsChart();

    // Update investment breakdown chart
    updateInvestmentBreakdownChart();

    // Update transaction list
    refreshTransactionsList();

    // Update portfolio stats
    updatePortfolioStats();

    // Update last updated time
    updateLastUpdatedTime();
  },

  // Save transactions to localStorage
  saveTransactions() {
    localStorage.setItem(
      "dashboardTransactions",
      JSON.stringify(this.transactions)
    );
  },

  // Load transactions from localStorage
  loadTransactions() {
    const savedTransactions = localStorage.getItem("dashboardTransactions");
    if (savedTransactions) {
      this.transactions = JSON.parse(savedTransactions);

      // Recalculate current portfolio value
      this.currentPortfolioValue = this.initialPortfolioValue;
      this.transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          this.currentPortfolioValue += parseFloat(transaction.amount);
        } else {
          this.currentPortfolioValue -= parseFloat(transaction.amount);
        }
      });
    }
  },
};

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

// Update portfolio stats
function updatePortfolioStats() {
  const totalAssetsEl = document.getElementById("total-assets");
  const portfolioGrowthEl = document.getElementById("portfolio-growth");

  if (totalAssetsEl) {
    totalAssetsEl.textContent = `$${dashboardData.currentPortfolioValue.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  if (portfolioGrowthEl) {
    // Calculate growth based on first and last values in portfolio history
    const portfolioHistory = dashboardData.generatePortfolioHistory();
    const firstValue = portfolioHistory.data[0];
    const lastValue = portfolioHistory.data[portfolioHistory.data.length - 1];

    const growthPercentage = (lastValue / firstValue - 1) * 100;

    portfolioGrowthEl.textContent = `${
      growthPercentage >= 0 ? "+" : ""
    }${growthPercentage.toFixed(1)}%`;

    portfolioGrowthEl.className = `stat-value ${
      growthPercentage >= 0 ? "green" : "red"
    }`;
  }

  // Update income and expenses
  const incomeEl = document.getElementById("total-income");
  const expensesEl = document.getElementById("total-expenses");

  if (incomeEl && expensesEl) {
    const financialData = dashboardData.calculateExpenseSavingsData();

    incomeEl.textContent = `$${financialData.income.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    expensesEl.textContent = `$${financialData.expense.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }
}

// Update Portfolio Growth Chart
function updatePortfolioChart() {
  const ctx = document.getElementById("portfolioGrowthChart");
  if (!ctx) {
    console.error("Could not find portfolioGrowthChart");
    return;
  }

  const portfolioHistory = dashboardData.generatePortfolioHistory();

  if (portfolioChart) {
    portfolioChart.data.labels = portfolioHistory.labels;
    portfolioChart.data.datasets[0].data = portfolioHistory.data;
    portfolioChart.update();
  } else {
    portfolioChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: portfolioHistory.labels,
        datasets: [
          {
            label: "Portfolio Value",
            data: portfolioHistory.data,
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
}

// Update Expense vs Savings Chart
function updateExpenseSavingsChart() {
  const ctx = document.getElementById("expenseSavingsChart");
  if (!ctx) {
    console.error("Could not find expenseSavingsChart");
    return;
  }

  const financialData = dashboardData.calculateExpenseSavingsData();

  // Prepare data for the chart
  const chartData = [
    financialData.expense_percentage,
    financialData.savings_percentage,
    financialData.others_percentage,
  ];

  if (expenseSavingsChart) {
    expenseSavingsChart.data.datasets[0].data = chartData;
    expenseSavingsChart.update();
  } else {
    expenseSavingsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Expenses", "Savings", "Others"],
        datasets: [
          {
            data: chartData,
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
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const label = tooltipItem.label;
                const value = tooltipItem.raw.toFixed(1) + "%";
                return `${label}: ${value}`;
              },
            },
          },
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }
}

// Update Investment Breakdown Chart
function updateInvestmentBreakdownChart() {
  const ctx = document.getElementById("investmentBreakdownChart");
  if (!ctx) {
    console.error("Could not find investmentBreakdownChart");
    return;
  }

  const investmentData = dashboardData.calculateInvestmentBreakdown();

  if (investmentBreakdownChart) {
    investmentBreakdownChart.data.datasets[0].data = investmentData.values;
    investmentBreakdownChart.update();
  } else {
    investmentBreakdownChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["SIP", "Mutual Funds", "Stocks"],
        datasets: [
          {
            data: investmentData.values,
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
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const label = tooltipItem.label;
                const value = tooltipItem.raw.toFixed(1) + "%";
                return `${label}: ${value}`;
              },
            },
          },
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }
}

// Refresh transactions list
function refreshTransactionsList() {
  const transactionsList = document.getElementById("transactions-list");
  if (!transactionsList) {
    console.error("Could not find transactions-list");
    return;
  }

  // Clear the list
  transactionsList.innerHTML = "";

  // Add all transactions to the list
  dashboardData.transactions.forEach((transaction, index) => {
    const newRow = document.createElement("tr");

    const dateObj = new Date(transaction.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    newRow.innerHTML = `
      <td>${formattedDate}</td>
      <td>${transaction.category}</td>
      <td class="${transaction.type === "income" ? "green" : "red"}">${
      transaction.type === "income" ? "Income" : "Expense"
    }</td>
      <td>$${parseFloat(transaction.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}</td>
      <td>
        <button class="delete-btn" data-index="${index}">
          <span class="delete-icon">×</span>
        </button>
      </td>
    `;

    transactionsList.appendChild(newRow);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      dashboardData.removeTransaction(index);
      showNotification("Transaction deleted successfully!");
    });
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
    const categoryElement = document.getElementById("transaction-category");
    const category =
      categoryElement.options[categoryElement.selectedIndex].text;
    const dateInput = document.getElementById("transaction-date").value;

    // Create transaction object
    const transaction = {
      amount: parseFloat(amount),
      type: type,
      category: category,
      date: dateInput,
    };

    // Add to data store
    dashboardData.addTransaction(transaction);

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
      dashboardData.portfolioMonths = months;
      updatePortfolioChart();

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
    // Load saved transactions
    dashboardData.loadTransactions();

    // Initialize all charts and UI
    dashboardData.updateAllCharts();

    // Setup event listeners
    setupTransactionForm();
    setupTimeButtons();
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
  
  /* Add delete button styling */
  .delete-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: var(--danger-color, #ef4444);
    font-size: 1.2rem;
    line-height: 1;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  
  .delete-btn:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }
  
  .delete-icon {
    font-weight: bold;
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
  addTransaction: (transaction) => dashboardData.addTransaction(transaction),
  removeTransaction: (index) => dashboardData.removeTransaction(index),
  getAllTransactions: () => dashboardData.transactions,
  getCurrentPortfolioValue: () => dashboardData.currentPortfolioValue,
  updateAllCharts: () => dashboardData.updateAllCharts(),
};
