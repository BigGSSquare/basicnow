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

// Add event listeners for watchlist buttons
const watchlistButtons = document.querySelectorAll(".watchlist-btn");
watchlistButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const stockName =
      this.closest(".stock-card").querySelector(".stock-name").textContent;
    showNotification(`${stockName} added to watchlist!`);

    // Toggle button text
    if (this.textContent === "Add to Watchlist") {
      this.textContent = "Remove from Watchlist";
    } else {
      this.textContent = "Add to Watchlist";
    }
  });
});

// Add event listeners for view buttons
const viewButtons = document.querySelectorAll(".view-btn");
viewButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const stockName =
      this.closest(".stock-card").querySelector(".stock-name").textContent;
    const stockTicker =
      this.closest(".stock-card").querySelector(".stock-ticker").textContent;
    showNotification(`Viewing details for ${stockName} (${stockTicker})`);
  });
});

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
