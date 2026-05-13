const greetingEl = document.querySelector("#greeting");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchHintEl = document.querySelector("#search-hint");
const quickLinksContainer = document.querySelector(".quick-links");

const currentEngineBtn = document.querySelector("#current-engine");
const engineDropdown = document.querySelector("#engine-dropdown");
const engineOptions = [...document.querySelectorAll(".engine-option")];

const onboardingOverlay = document.querySelector("#onboarding-overlay");
const onboardingCards = [...document.querySelectorAll(".onboarding-card")];
const nameInput = document.querySelector("#name-input");
const customUrl1Input = document.querySelector("#custom-url-1");
const customUrl2Input = document.querySelector("#custom-url-2");

const editModeToggle = document.querySelector("#edit-mode-toggle");
const shortcutSidebar = document.querySelector("#shortcut-sidebar");
const sidebarList = document.querySelector("#sidebar-list");
const suggestionsList = document.querySelector("#suggestions-list");
const closeSidebarBtn = document.querySelector("#close-sidebar");
const saveLayoutBtn = document.querySelector("#save-layout");
const addCustomBtn = document.querySelector("#add-custom-shortcut");

const customModal = document.querySelector("#custom-link-modal");
const newLinkLabel = document.querySelector("#new-link-label");
const newLinkUrl = document.querySelector("#new-link-url");
const cancelModalBtn = document.querySelector("#cancel-modal");
const confirmModalBtn = document.querySelector("#confirm-modal");
const viewportMeta = document.querySelector("#viewport");

const featuresToggle = document.querySelector("#features-toggle");
const featuresSidebar = document.querySelector("#features-sidebar");
const closeFeaturesBtn = document.querySelector("#close-features");
const saveFeaturesBtn = document.querySelector("#save-features");

const toggleAliases = document.querySelector("#toggle-aliases");
const toggleFocusMode = document.querySelector("#toggle-focus-mode");
const toggleGlass = document.querySelector("#toggle-glass");

let currentEngineUrl = "https://www.google.com/search?q=";
let isEditMode = false;
let isFeaturesMode = false;

const SEARCH_ALIASES = {
  gpt: { name: "ChatGPT", url: "https://chatgpt.com/?q=" },
  ppx: { name: "Perplexity", url: "https://www.perplexity.ai/search/new?q=" },
  amz: { name: "Amazon", url: "https://www.amazon.com/s?k=" },
  yt: { name: "YouTube", url: "https://www.youtube.com/results?search_query=" },
  cl: { name: "Claude", url: "https://claude.ai/new?q=" },
  gem: { name: "Gemini", url: "https://gemini.google.com/app?q=" },
  g: { name: "Google", url: "https://www.google.com/search?q=" },
};

const SUGGESTIONS = [
  { label: "Gmail", url: "https://mail.google.com" },
  { label: "Calendar", url: "https://calendar.google.com" },
  { label: "Keep", url: "https://keep.google.com" },
  { label: "Notion", url: "https://notion.so" },
  { label: "YouTube", url: "https://youtube.com" },
  { label: "LinkedIn", url: "https://linkedin.com" },
  { label: "Twitter", url: "https://twitter.com" },
  { label: "Instagram", url: "https://instagram.com" },
];

function getProfileName() {
  const storedName = localStorage.getItem("homeProfileName");
  if (!storedName) return "";
  return storedName.charAt(0).toUpperCase() + storedName.slice(1).toLowerCase();
}

function getGreetingPrefix(hour) {
  if (hour < 5) return "Still awake";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function updateGreeting() {
  const now = new Date();
  const name = getProfileName();
  const prefix = getGreetingPrefix(now.getHours());

  if (!name) {
    onboardingOverlay.classList.add("active");
    greetingEl.innerHTML = `${prefix}.`;
    setTimeout(() => nameInput.focus(), 100);
    return;
  }

  onboardingOverlay.classList.remove("active");
  greetingEl.innerHTML = `<span>${prefix},</span> <span class="user-name">${name}</span>`;
  setTimeout(() => searchInput.focus(), 100);
}

function getFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}

function createShortcutElement(label, url) {
  const a = document.createElement("a");
  a.className = "quick-link";
  a.href = url;
  a.dataset.label = label;

  const icon = getFavicon(url);
  if (icon) {
    const img = document.createElement("img");
    img.src = icon;
    img.alt = label;
    a.appendChild(img);
  } else {
    const span = document.createElement("span");
    span.className = "brand";
    span.textContent = label[0].toUpperCase();
    a.appendChild(span);
  }

  const labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = label;
  a.appendChild(labelSpan);

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-shortcut";
  removeBtn.innerHTML = "&times;";
  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideShortcut(label);
  });
  a.appendChild(removeBtn);

  return a;
}

function updateShortcutVisibility() {
  const hiddenShortcuts = JSON.parse(
    localStorage.getItem("hiddenShortcuts") || "[]",
  );
  const customShortcuts = JSON.parse(
    localStorage.getItem("customShortcuts") || "[]",
  );
  const onboardedUrls = JSON.parse(localStorage.getItem("customUrls") || "{}");

  // Base links (hardcoded in HTML originally, but we manage them via state now)
  const defaultLinks = [
    { label: "Google", url: "https://www.google.com" },
    { label: "Perplexity", url: "https://www.perplexity.ai" },
    { label: "ChatGPT", url: "https://chatgpt.com" },
    { label: "Claude", url: "https://claude.ai" },
    { label: "Gemini", url: "https://gemini.google.com" },
    { label: "Grok", url: "https://grok.com" },
    { label: "GitHub", url: "https://github.com" },
    { label: "Vercel", url: "https://vercel.com" },
    { label: "Pinterest", url: "https://www.pinterest.com" },
    { label: "Salesforce", url: "https://login.salesforce.com" },
  ];

  // Add onboarded if exists
  const onboarded = [];
  if (onboardedUrls.url1)
    onboarded.push({ label: "Custom 1", url: onboardedUrls.url1 });
  if (onboardedUrls.url2)
    onboarded.push({ label: "Custom 2", url: onboardedUrls.url2 });

  const allPossible = [...defaultLinks, ...onboarded, ...customShortcuts];

  // Dedup by label
  const uniqueLinks = [];
  const labels = new Set();
  allPossible.forEach((l) => {
    if (!labels.has(l.label)) {
      uniqueLinks.push(l);
      labels.add(l.label);
    }
  });

  quickLinksContainer.innerHTML = "";
  sidebarList.innerHTML = "";
  suggestionsList.innerHTML = "";

  uniqueLinks.forEach((link) => {
    const isHidden = hiddenShortcuts.includes(link.label);
    if (isHidden) {
      addSidebarItem(link, sidebarList, true);
    } else {
      const el = createShortcutElement(link.label, link.url);
      quickLinksContainer.appendChild(el);
    }
  });

  // Render Suggestions
  SUGGESTIONS.forEach((s) => {
    if (!labels.has(s.label)) {
      addSidebarItem(s, suggestionsList, false);
    }
  });
}

function addSidebarItem(link, container, isHidden) {
  const item = document.createElement("div");
  item.className = "sidebar-item";
  const icon = getFavicon(link.url);

  item.innerHTML = `
    <div class="info">
      ${icon ? `<img src="${icon}" alt="">` : `<span class="brand">${link.label[0]}</span>`}
      <span>${link.label}</span>
    </div>
    <button class="add-shortcut" data-label="${link.label}" data-url="${link.url}">+</button>
  `;

  item.querySelector(".add-shortcut").addEventListener("click", () => {
    if (isHidden) {
      showShortcut(link.label);
    } else {
      addCustomShortcut(link.label, link.url);
    }
  });

  container.appendChild(item);
}

function hideShortcut(label) {
  const hidden = JSON.parse(localStorage.getItem("hiddenShortcuts") || "[]");
  if (!hidden.includes(label)) {
    hidden.push(label);
    localStorage.setItem("hiddenShortcuts", JSON.stringify(hidden));
    updateShortcutVisibility();
    if (window.gtag) gtag("event", "remove_shortcut", { label: label });
  }
}

function showShortcut(label) {
  let hidden = JSON.parse(localStorage.getItem("hiddenShortcuts") || "[]");
  hidden = hidden.filter((l) => l !== label);
  localStorage.setItem("hiddenShortcuts", JSON.stringify(hidden));
  updateShortcutVisibility();
  if (window.gtag) gtag("event", "add_shortcut", { label: label, type: "restore" });
}

function addCustomShortcut(label, url) {
  const custom = JSON.parse(localStorage.getItem("customShortcuts") || "[]");
  custom.push({ label, url });
  localStorage.setItem("customShortcuts", JSON.stringify(custom));
  updateShortcutVisibility();
  if (window.gtag) gtag("event", "add_shortcut", { label: label, type: "custom" });
}

function toggleEditMode() {
  isEditMode = !isEditMode;
  document.body.classList.toggle("edit-mode", isEditMode);
  shortcutSidebar.classList.toggle("active", isEditMode);
  if (isEditMode && isFeaturesMode) toggleFeaturesMode();

  if (isEditMode) {
    viewportMeta.setAttribute("content", "width=1200");
    if (window.gtag) gtag("event", "open_customize");
  } else {
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
    if (window.gtag) gtag("event", "save_customization");
    setTimeout(() => searchInput.focus(), 100);
  }
}

function toggleFeaturesMode() {
  isFeaturesMode = !isFeaturesMode;
  featuresSidebar.classList.toggle("active", isFeaturesMode);
  if (isFeaturesMode && isEditMode) toggleEditMode();
  
  if (!isFeaturesMode) {
    setTimeout(() => searchInput.focus(), 100);
  }
}

function updateFeatureStates() {
  const states = {
    aliases: toggleAliases.checked,
    focusMode: toggleFocusMode.checked,
    glass: toggleGlass.checked,
  };
  localStorage.setItem("featureStates", JSON.stringify(states));

  document.body.classList.toggle("focus-mode", states.focusMode);
  document.body.classList.toggle("extra-glass", states.glass);
}

function loadFeatureStates() {
  const saved = JSON.parse(localStorage.getItem("featureStates") || "{}");
  if (saved.aliases !== undefined) toggleAliases.checked = saved.aliases;
  if (saved.focusMode !== undefined) toggleFocusMode.checked = saved.focusMode;
  if (saved.glass !== undefined) toggleGlass.checked = saved.glass;
  updateFeatureStates();
}

// Onboarding logic
document.querySelector(".next-step").addEventListener("click", () => {
  if (nameInput.value.trim()) {
    localStorage.setItem("homeProfileName", nameInput.value.trim());
    onboardingCards[0].classList.remove("active");
    onboardingCards[1].classList.add("active");
    setTimeout(() => customUrl1Input.focus(), 100);
  }
});

document.querySelector("#skip-urls").addEventListener("click", () => {
  localStorage.setItem("customUrls", JSON.stringify({}));
  onboardingOverlay.classList.remove("active");
  updateGreeting();
  updateShortcutVisibility();
  if (window.gtag) gtag("event", "onboarding_complete", { method: "skip" });
});

document.querySelector("#save-onboarding").addEventListener("click", () => {
  const urls = {
    url1: customUrl1Input.value.trim(),
    url2: customUrl2Input.value.trim(),
  };
  localStorage.setItem("customUrls", JSON.stringify(urls));
  onboardingOverlay.classList.remove("active");
  updateGreeting();
  updateShortcutVisibility();
  if (window.gtag) gtag("event", "onboarding_complete", { method: "save_urls" });
});

// Modal Logic
addCustomBtn.addEventListener("click", () =>
  customModal.classList.add("active"),
);
cancelModalBtn.addEventListener("click", () =>
  customModal.classList.remove("active"),
);
confirmModalBtn.addEventListener("click", () => {
  const label = newLinkLabel.value.trim();
  const url = newLinkUrl.value.trim();
  if (label && url) {
    addCustomShortcut(label, url);
    customModal.classList.remove("active");
    newLinkLabel.value = "";
    newLinkUrl.value = "";
    setTimeout(() => searchInput.focus(), 100);
  }
});

// Search Logic
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let query = searchInput.value.trim();
  if (!query) return;

  let targetUrl = currentEngineUrl;

  // Handle Aliases
  if (toggleAliases.checked) {
    const parts = query.split(" ");
    const alias = parts[0].toLowerCase();
    if (SEARCH_ALIASES[alias]) {
      targetUrl = SEARCH_ALIASES[alias].url;
      query = parts.slice(1).join(" ");
      if (!query) {
        window.location.assign(targetUrl.split("?")[0]);
        return;
      }
    }
  }

  const isUrl =
    /^https?:\/\//.test(query) || (query.includes(".") && !query.includes(" "));
  
  window.location.assign(
    isUrl
      ? query.startsWith("http")
        ? query
        : `https://${query}`
      : `${targetUrl}${encodeURIComponent(query)}`,
  );
});

currentEngineBtn.addEventListener("click", () => {
  engineDropdown.classList.toggle("active");
  document.body.classList.toggle(
    "dropdown-active",
    engineDropdown.classList.contains("active"),
  );
});

engineOptions.forEach((opt) =>
  opt.addEventListener("click", () => {
    const icon = opt.querySelector(".engine-icon").textContent;
    currentEngineUrl = opt.dataset.url;
    currentEngineBtn.textContent = icon;

    // Close the dropdown
    engineDropdown.classList.remove("active");
    engineDropdown.classList.add("force-hidden");
    document.body.classList.remove("dropdown-active");

    localStorage.setItem("preferredSearchEngine", opt.dataset.engine);
  }),
);

const engineSelector = document.querySelector(".engine-selector");

// Show and lock background on hover
engineSelector.addEventListener("mouseenter", () => {
  document.body.classList.add("dropdown-active");
  engineDropdown.classList.remove("force-hidden");
});

// Close and unlock background when mouse leaves
engineSelector.addEventListener("mouseleave", () => {
  document.body.classList.remove("dropdown-active");
  engineDropdown.classList.remove("active");
});

editModeToggle.addEventListener("click", toggleEditMode);
closeSidebarBtn.addEventListener("click", toggleEditMode);
saveLayoutBtn.addEventListener("click", toggleEditMode);

featuresToggle.addEventListener("click", toggleFeaturesMode);
closeFeaturesBtn.addEventListener("click", toggleFeaturesMode);
saveFeaturesBtn.addEventListener("click", toggleFeaturesMode);

[toggleAliases, toggleFocusMode, toggleGlass].forEach(el => {
  el.addEventListener("change", updateFeatureStates);
});

// Init
loadFeatureStates();
const savedEngine = localStorage.getItem("preferredSearchEngine");
if (savedEngine) {
  const opt = engineOptions.find((o) => o.dataset.engine === savedEngine);
  if (opt) {
    currentEngineUrl = opt.dataset.url;
    currentEngineBtn.textContent =
      opt.querySelector(".engine-icon").textContent;
  }
}

updateGreeting();
updateShortcutVisibility();
