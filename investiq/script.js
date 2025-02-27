document.addEventListener("DOMContentLoaded", function () {
  // 🌙 Dark Mode Toggle
  document
    .getElementById("theme-toggle")
    .addEventListener("click", () =>
      document.body.classList.toggle("dark-mode")
    );

  // 📈 AI Prediction Data Simulation
  setTimeout(() => {
    document.getElementById("prediction").textContent = "$13,500 (+8%)";
  }, 2000);

  // 💰 Expense Tracker
  let totalExpenses = 0;
  let savingsBalance = 0;
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const totalExpensesEl = document.getElementById("total-expenses");
  const savingsAccountEl = document.getElementById("savings-account");
  const expenseList = document.getElementById("expense-list");

  // 📊 Chart.js for Pie Chart
  const ctx = document.getElementById("expenseChart").getContext("2d");
  let expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: ["#f57c00", "#9c27b0", "#2a0c49", "#ff9800"],
        },
      ],
    },
  });

  const updateBalances = () => {
    totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalExpensesEl.textContent = `$${totalExpenses}`;
    savingsAccountEl.textContent = `$${savingsBalance}`;

    expenseChart.data.labels = expenses.map((exp) => exp.name);
    expenseChart.data.datasets[0].data = expenses.map((exp) => exp.amount);
    expenseChart.update();
  };

  document
    .getElementById("expense-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("expense-name").value.trim();
      const amount = parseFloat(
        document.getElementById("expense-amount").value
      );

      if (name && amount > 0) {
        expenses.push({ name, amount });
        localStorage.setItem("expenses", JSON.stringify(expenses));
        updateBalances();
        e.target.reset();
      }
    });

  new Chart(document.getElementById("predictionChart"), {
    type: "line",
    data: {
      labels: ["2023", "2024", "2025"],
      datasets: [
        { data: [12000, 13500, 15000], borderColor: "#2a0c49", fill: false },
      ],
    },
  });

  updateBalances();
});
