let allowedKeywords = [];
let allowedChannels = [];
let protectionEnabled = true;

// Helper to normalize text
function cleanText(str) {
  return str?.trim().toLowerCase() || "";
}

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(
    {
      allowedKeywords: [
        "lesson", "tutorial", "lecture", "how to",
        "khanacademy", "math", "science", "study"
      ],
      allowedChannels: [],
      protectionEnabled: true
    },
    (data) => {
      allowedKeywords = data.allowedKeywords.map(k => k.toLowerCase());
      allowedChannels = data.allowedChannels.map(c => c.toLowerCase());
      protectionEnabled = data.protectionEnabled;

      checkAndBlock();
    }
  );
}

// Block video
function blockVideo() {
  document.querySelectorAll('video').forEach(video => {
    video.pause();
    video.currentTime = 0;
    const playerContainer = video.closest('.html5-video-player, ytd-player, ytd-reel-video-renderer');
    if (playerContainer) playerContainer.style.display = "none";
  });

  let blockBox = document.getElementById("kidguard-block");
  if (!blockBox) {
    blockBox = document.createElement("div");
    blockBox.id = "kidguard-block";
    blockBox.style.cssText = `
      padding:20px;
      background:#fff;
      color:#000;
      font-size:18px;
      text-align:center;
      border:2px solid #333;
      margin-top:20px;
    `;
    (document.querySelector("#primary") || document.body).prepend(blockBox);
  }

  blockBox.innerText = "Blocked by KidGuard: non-educational content.";
}

// Restore video
function restoreVideo() {
  document.querySelectorAll('video').forEach(video => {
    const playerContainer = video.closest('.html5-video-player, ytd-player, ytd-reel-video-renderer');
    if (playerContainer) playerContainer.style.display = "";
  });

  const blockBox = document.getElementById("kidguard-block");
  if (blockBox) blockBox.remove();
}

// Check current video and decide
function checkAndBlock() {
  if (!protectionEnabled) {
    restoreVideo();
    return;
  }

  // Get title
  const titleEl = document.querySelector(
    "h1.title, yt-formatted-string#title, h1.ytd-reel-player-header-renderer, yt-formatted-string.ytd-reel-player-header-renderer"
  );
  const title = cleanText(titleEl?.innerText);

  // Get channel
  const channelEl = document.querySelector(
    "ytd-channel-name a, #channel-name a, span.ytd-reel-player-header-renderer"
  );
  const channel = cleanText(channelEl?.innerText);

  // Debugging: see what the script actually reads
  console.log("KidGuard check:", { title, channel });

  // Check allowed keywords/channels
  const allowedByKeyword = allowedKeywords.some(k => title.includes(k));
  const allowedByChannel = allowedChannels.some(c => channel.includes(c));

  if (!allowedByKeyword && !allowedByChannel) {
    blockVideo();
  } else {
    restoreVideo();
  }
}

// Continuous polling to catch dynamically loaded videos
function startPolling() {
  setInterval(checkAndBlock, 1000);
}

// SPA navigation detection
let lastUrl = "";
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(checkAndBlock, 500);
  }
});
observer.observe(document, { subtree: true, childList: true });

// Listen for popup toggle changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.protectionEnabled) {
    protectionEnabled = changes.protectionEnabled.newValue;
    checkAndBlock();
  }
});

// Initial load
loadSettings();
startPolling();