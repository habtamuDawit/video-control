// ================================
// SHA-256 hashing function
// ================================
async function hash(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ================================
// INITIAL LOAD WITH PASSWORD CHECK
// ================================
document.addEventListener("DOMContentLoaded", async () => {
  checkPasswordLock();
  loadKeywords();
  loadChannels();
});

// ================================
// PASSWORD LOCK SYSTEM
// ================================
async function checkPasswordLock() {
  chrome.storage.sync.get({ parentPassword: "" }, async (data) => {
    const savedHash = data.parentPassword;

    // If no password set → unlock automatically
    if (!savedHash) {
      document.getElementById("loginOverlay").style.display = "none";
      return;
    }

    // Otherwise show login overlay
    document.getElementById("loginOverlay").style.display = "flex";

    document.getElementById("parentLoginBtn").onclick = async () => {
      const entered = document.getElementById("parentPasswordInput").value;
      const enteredHash = await hash(entered);

      if (enteredHash === savedHash) {
        // Correct password → unlock
        document.getElementById("loginOverlay").style.display = "none";
      } else {
        alert("Incorrect password!");
      }
    };
  });
}

// ================================
// SET / CHANGE PASSWORD
// ================================
document.getElementById("setPwdBtn").addEventListener("click", async () => {
  const current = document.getElementById("currentPwd").value.trim();
  const newPwd = document.getElementById("newPwd").value.trim();
  const confirmPwd = document.getElementById("confirmPwd").value.trim();
  const msg = document.getElementById("pwdMsg");

  if (!newPwd || !confirmPwd) {
    msg.style.color = "red";
    msg.textContent = "New password cannot be empty.";
    return;
  }

  if (newPwd !== confirmPwd) {
    msg.style.color = "red";
    msg.textContent = "Passwords do not match.";
    return;
  }

  chrome.storage.sync.get({ parentPassword: "" }, async (data) => {
    const savedHash = data.parentPassword;

    // If password exists → validate old password
    if (savedHash) {
      const currHash = await hash(current);

      if (currHash !== savedHash) {
        msg.style.color = "red";
        msg.textContent = "Current password is incorrect.";
        return;
      }
    }

    // Save new password hash
    const newHash = await hash(newPwd);
    chrome.storage.sync.set({ parentPassword: newHash });

    msg.style.color = "green";
    msg.textContent = "Password updated successfully!";
  });
});

// ================================
// LOAD KEYWORDS
// ================================
function loadKeywords() {
  chrome.storage.sync.get({ allowedKeywords: [] }, (data) => {
    const list = document.getElementById("keywordList");
    list.innerHTML = "";

    data.allowedKeywords.forEach((kw, index) => {
      const li = document.createElement("li");
      li.textContent = kw;

      const del = document.createElement("button");
      del.textContent = "X";
      del.onclick = () => removeKeyword(index);

      li.appendChild(del);
      list.appendChild(li);
    });
  });
}

// ================================
// LOAD CHANNELS
// ================================
function loadChannels() {
  chrome.storage.sync.get({ allowedChannels: [] }, (data) => {
    const list = document.getElementById("channelList");
    list.innerHTML = "";

    data.allowedChannels.forEach((ch, index) => {
      const li = document.createElement("li");
      li.textContent = ch;

      const del = document.createElement("button");
      del.textContent = "X";
      del.onclick = () => removeChannel(index);

      li.appendChild(del);
      list.appendChild(li);
    });
  });
}

// ================================
// ADD KEYWORD
// ================================
document.getElementById("addKeywordBtn").addEventListener("click", () => {
  const input = document.getElementById("keywordInput");
  const val = input.value.trim();
  if (!val) return;

  chrome.storage.sync.get({ allowedKeywords: [] }, (data) => {
    data.allowedKeywords.push(val);
    chrome.storage.sync.set({ allowedKeywords: data.allowedKeywords }, loadKeywords);
  });

  input.value = "";
});

// ================================
// ADD CHANNEL
// ================================
document.getElementById("addChannelBtn").addEventListener("click", () => {
  const input = document.getElementById("channelInput");
  const val = input.value.trim();
  if (!val) return;

  chrome.storage.sync.get({ allowedChannels: [] }, (data) => {
    data.allowedChannels.push(val);
    chrome.storage.sync.set({ allowedChannels: data.allowedChannels }, loadChannels);
  });

  input.value = "";
});

// ================================
// REMOVE KEYWORD
// ================================
function removeKeyword(index) {
  chrome.storage.sync.get({ allowedKeywords: [] }, (data) => {
    data.allowedKeywords.splice(index, 1);
    chrome.storage.sync.set({ allowedKeywords: data.allowedKeywords }, loadKeywords);
  });
}

// ================================
// REMOVE CHANNEL
// ================================
function removeChannel(index) {
  chrome.storage.sync.get({ allowedChannels: [] }, (data) => {
    data.allowedChannels.splice(index, 1);
    chrome.storage.sync.set({ allowedChannels: data.allowedChannels }, loadChannels);
  });
}