// Reference to the icon circle
const iconCircle = document.querySelector('.icon-circle');

// Load current state from storage when popup opens
chrome.storage.sync.get({ protectionEnabled: true }, (data) => {
  document.getElementById("toggleProtection").checked = data.protectionEnabled;
  updateStatusText(data.protectionEnabled);
  updateIconColor(data.protectionEnabled);
});

// Update status text
function updateStatusText(enabled) {
  document.getElementById("status").textContent =
    enabled ? "Status: Protected" : "Status: Disabled";
}

// Update icon color based on protection state
function updateIconColor(enabled) {
  iconCircle.style.fill = enabled ? 'green' : 'red';
}

// When user toggles the switch
document.getElementById("toggleProtection").addEventListener("change", () => {
  const enabled = document.getElementById("toggleProtection").checked;

  // Save the new state
  chrome.storage.sync.set({ protectionEnabled: enabled });

  // Update UI text
  updateStatusText(enabled);

  // Update icon color
  updateIconColor(enabled);

  // Notify background.js
  chrome.runtime.sendMessage({
    type: "PROTECTION_TOGGLE",
    enabled: enabled
  });
});

// Open settings page when clicking the button
document.getElementById("openSettings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Optional: Color buttons to manually change icon
document.getElementById('green-btn')?.addEventListener('click', () => iconCircle.style.fill = 'green');
document.getElementById('red-btn')?.addEventListener('click', () => iconCircle.style.fill = 'red');
document.getElementById('yellow-btn')?.addEventListener('click', () => iconCircle.style.fill = 'goldenrod');
