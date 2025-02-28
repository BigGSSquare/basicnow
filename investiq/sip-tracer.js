// JavaScript for SIP Tracker functionality

document.addEventListener("DOMContentLoaded", function () {
  // Theme toggling (existing functionality)
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      body.classList.toggle("dark-mode");
      const toggleIcon = themeToggle.querySelector(".toggle-icon");
      const toggleText = themeToggle.querySelector(".toggle-text");

      if (body.classList.contains("dark-mode")) {
        toggleIcon.textContent = "☀️";
        toggleText.textContent = "Light Mode";
      } else {
        toggleIcon.textContent = "🌙";
        toggleText.textContent = "Dark Mode";
      }
    });
  }

  // SIP Tracker Functionality

  // Modal controls
  const addSipBtn = document.getElementById("add-sip-btn");
  const addSipModal = document.getElementById("add-sip-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const cancelSipBtn = document.getElementById("cancel-sip-btn");
  const saveSipBtn = document.getElementById("save-sip-btn");
  const addSipForm = document.getElementById("add-sip-form");

  // Open modal
  if (addSipBtn && addSipModal) {
    addSipBtn.addEventListener("click", function () {
      addSipModal.classList.remove("hidden");
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      document.getElementById("sip-start-date").value = today;
    });
  }

  // Close modal with X button
  if (closeModalBtn && addSipModal) {
    closeModalBtn.addEventListener("click", function () {
      addSipModal.classList.add("hidden");
    });
  }

  // Close modal with Cancel button
  if (cancelSipBtn && addSipModal) {
    cancelSipBtn.addEventListener("click", function () {
      addSipModal.classList.add("hidden");
    });
  }

  // Save SIP
  if (saveSipBtn && addSipForm && addSipModal) {
    saveSipBtn.addEventListener("click", function () {
      // Validate form
      const fundName = document.getElementById("sip-fund-name");
      const sipAmount = document.getElementById("sip-amount");
      const sipTenure = document.getElementById("sip-tenure");
      const sipReturns = document.getElementById("sip-expected-returns");
      const sipStartDate = document.getElementById("sip-start-date");

      if (
        !fundName.value ||
        !sipAmount.value ||
        !sipTenure.value ||
        !sipReturns.value ||
        !sipStartDate.value
      ) {
        showNotification("Please fill all required fields", "error");
        return;
      }

      // Add new SIP (in real app, this would save to database)
      addNewSIP();

      // Show notification and close modal
      showNotification("New SIP added successfully!");
      addSipModal.classList.add("hidden");
      addSipForm.reset();
    });
  }

  // Edit SIP functionality
  const editButtons = document.querySelectorAll(".edit-sip-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const sipCard = this.closest(".sip-card");
      const sipName = sipCard.querySelector(".sip-name").textContent;
      showNotification(`Editing SIP: ${sipName}`);
      // In a real app, we would open the modal with pre-filled data
    });
  });

  // Delete SIP functionality
  const deleteButtons = document.querySelectorAll(".delete-sip-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const sipCard = this.closest(".sip-card");
      const sipName = sipCard.querySelector(".sip-name").textContent;

      // Confirm deletion
      if (confirm(`Are you sure you want to delete the SIP for ${sipName}?`)) {
        // Remove the card with animation
        sipCard.style.opacity = "0";
        setTimeout(() => {
          sipCard.remove();
          updateSipStats();
          showNotification(`SIP for ${sipName} has been deleted`);
        }, 300);
      }
    });
  });

  // Function to add new SIP
  function addNewSIP() {
    // Get values from form
    const fundName = document.getElementById("sip-fund-name").value;
    const riskLevel = document.getElementById("sip-risk-level").value;
    const amount = document.getElementById("sip-amount").value;
    const tenure = document.getElementById("sip-tenure").value;
    const expectedReturns = document.getElementById(
      "sip-expected-returns"
    ).value;
    const startDate = new Date(document.getElementById("sip-start-date").value);

    // Format start date
    const formattedDate = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Create risk class and label based on selection
    let riskClass, riskLabel;
    switch (riskLevel) {
      case "low":
        riskClass = "low-risk";
        riskLabel = "Low Risk";
        break;
      case "medium":
        riskClass = "med-risk";
        riskLabel = "Medium Risk";
        break;
      case "high":
        riskClass = "high-risk";
        riskLabel = "High Risk";
        break;
    }

    // Calculate a random growth percentage for demonstration
    const growth = (Math.random() * 20 + 5).toFixed(1);
    const currentValue = (
      parseFloat(amount) *
      (1 + parseFloat(growth) / 100)
    ).toFixed(0);

    // Create new SIP card
    const newSIPCard = document.createElement("div");
    newSIPCard.className = `sip-card ${riskClass}`;
    newSIPCard.innerHTML = `
      <div class="sip-header">
        <div class="sip-title">
          <div class="sip-name">${fundName}</div>
          <span class="tag ${riskClass}">${riskLabel}</span>
        </div>
        <div class="sip-actions">
          <button class="edit-sip-btn"><i class="fas fa-edit"></i></button>
          <button class="delete-sip-btn"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="sip-details">
        <div class="sip-amount">
          <div class="detail-label">Monthly Investment</div>
          <div class="detail-value">₹${amount}</div>
        </div>
        <div class="sip-tenure">
          <div class="detail-label">Tenure</div>
          <div class="detail-value">${tenure} years</div>
        </div>
        <div class="sip-returns">
          <div class="detail-label">Expected Returns</div>
          <div class="detail-value">${expectedReturns}%</div>
        </div>
        <div class="sip-start-date">
          <div class="detail-label">Started On</div>
          <div class="detail-value">${formattedDate}</div>
        </div>
      </div>
      <div class="sip-performance">
        <div class="progress-container">
          <div class="progress-bar" style="width: ${Math.min(
            95,
            Math.random() * 30 + 60
          )}%"></div>
        </div>
        <div class="performance-stats">
          <div class="current-value">Current: ₹${currentValue}</div>
          <div class="growth positive">+${growth}%</div>
        </div>
      </div>
    `;

    // Add the new card to the container
    const sipCardsContainer = document.querySelector(".sip-cards");
    sipCardsContainer.appendChild(newSIPCard);

    // Add event listeners to new buttons
    const newEditBtn = newSIPCard.querySelector(".edit-sip-btn");
    const newDeleteBtn = newSIPCard.querySelector(".delete-sip-btn");

    newEditBtn.addEventListener("click", function () {
      showNotification(`Editing SIP: ${fundName}`);
    });

    newDeleteBtn.addEventListener("click", function () {
      if (confirm(`Are you sure you want to delete the SIP for ${fundName}?`)) {
        newSIPCard.style.opacity = "0";
        setTimeout(() => {
          newSIPCard.remove();
          updateSipStats();
          showNotification(`SIP for ${fundName} has been deleted`);
        }, 300);
      }
    });

    // Update summary stats
    updateSipStats();
  }

  // Function to update SIP summary statistics
  function updateSipStats() {
    const sipCards = document.querySelectorAll(".sip-card");
    const totalSIPsElement = document.querySelector(
      ".sip-stats .sip-stat-item:nth-child(3) .stat-value"
    );

    if (totalSIPsElement) {
      totalSIPsElement.textContent = sipCards.length;
    }

    // Calculate total investment and current value
    let totalInvestment = 0;
    let totalCurrentValue = 0;

    sipCards.forEach((card) => {
      const amountText = card.querySelector(
        ".sip-amount .detail-value"
      ).textContent;
      const amount = parseFloat(amountText.replace("₹", "").replace(",", ""));

      const currentValueText = card.querySelector(".current-value").textContent;
      const currentValue = parseFloat(
        currentValueText.split("₹")[1].replace(",", "")
      );

      totalInvestment += amount;
      totalCurrentValue += currentValue;
    });

    // Update total investment
    const totalInvestmentElement = document.querySelector(
      ".sip-stats .sip-stat-item:nth-child(1) .stat-value"
    );
    if (totalInvestmentElement) {
      totalInvestmentElement.textContent =
        "₹" + totalInvestment.toLocaleString();
    }

    // Update current value
    const totalCurrentValueElement = document.querySelector(
      ".sip-stats .sip-stat-item:nth-child(2) .stat-value"
    );
    if (totalCurrentValueElement) {
      totalCurrentValueElement.textContent =
        "₹" + totalCurrentValue.toLocaleString();
    }

    // Calculate overall growth percentage
    const overallGrowth = (
      ((totalCurrentValue - totalInvestment) / totalInvestment) *
      100
    ).toFixed(1);
    const growthElement = document.querySelector(
      ".sip-stats .sip-stat-item:nth-child(2) .stat-change"
    );
    if (growthElement) {
      growthElement.textContent = `+${overallGrowth}% overall`;
    }
  }

  // Function to show notification
  function showNotification(message, type = "success") {
    const notification = document.getElementById("update-notification");
    const notificationMessage = document.getElementById("notification-message");

    if (notification && notificationMessage) {
      // Set message
      notificationMessage.textContent = message;

      // Set type-based styling
      if (type === "error") {
        notification.style.backgroundColor = "var(--danger-color)";
      } else {
        notification.style.backgroundColor = "var(--primary-color)";
      }

      // Show notification
      notification.classList.remove("hidden");

      // Hide after 3 seconds
      setTimeout(() => {
        notification.classList.add("hidden");
      }, 3000);
    }
  }
});
