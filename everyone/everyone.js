//const API_BASE_URI = "http://127.0.0.1:4444/api/guest";
const API_BASE_URI = "https://attandance-app-1.onrender.com/api/guest";

// Syncing state variables directly with your backend response properties
let currentPage = 1;
let totalPages = 1;
const recordsPerPage = 10;
let currentSearchTerm = "";
let searchTimeout = null;

// Control loader overlay visibility
function toggleLoader(show) {
  const overlay = document.getElementById("loaderOverlay");
  if (!overlay) return;
  overlay.classList.toggle("active", show);
}

// FIX 1: Prevent crash if a public user has no local storage session context saved
const storedUser = localStorage.getItem("user");
if (storedUser) {
  try {
    const user = JSON.parse(storedUser);
    if (user && user.avatarUrl) {
      const logoEl = document.querySelector(".logo");
      if (logoEl) logoEl.src = user.avatarUrl;
    }
  } catch (e) {
    console.error("Error parsing user profile avatar data:", e);
  }
}

/**
 * PIN Access Control & Input Triggers
 */
document.addEventListener("DOMContentLoaded", () => {
  const orgSelect = document.querySelector("#orgSelect");
  if (orgSelect) {
    orgSelect.addEventListener("change", handleOrgChange);
  }

  // FIX 2: Dynamically attach missing step and backspace listener loops to your layout inputs
  const pinInputs = document.querySelectorAll(".pin-box");
  pinInputs.forEach((input, index) => {
    // Listens for active digit entries
    input.addEventListener("input", (e) => {
      handlePinStep(e.target, index);
    });

    // Listens for structural backspace keyboard controls
    input.addEventListener("keydown", (e) => {
      handlePinBack(e, index);
    });
  });

  // Attach search bar input event listener
  const userSearch = document.getElementById("userSearch");
  if (userSearch) {
    userSearch.addEventListener("input", filterPublicNames);
  }
});

function handleOrgChange() {
  const org = document.getElementById("orgSelect").value;
  const drawer = document.getElementById("authCodeWrapper");
  const loadBtn = document.getElementById("loadBtn");
  const pinInputs = document.querySelectorAll(".pin-box");

  if (!drawer) return;

  if (org) {
    drawer.classList.add("open");
    pinInputs.forEach((i) => (i.value = ""));
    if (pinInputs.length > 0) pinInputs[0].focus();
  } else {
    drawer.classList.remove("open");
    if (loadBtn) loadBtn.disabled = true;
    const searchBar = document.getElementById("userSearch");
    if (searchBar) searchBar.disabled = true;
  }
}

function handlePinStep(input, index) {
  input.value = input.value.replace(/\D/g, ""); // Digits numbers only

  const pinInputs = document.querySelectorAll(".pin-box");
  if (input.value.length === 1 && index < 5) {
    if (pinInputs[index + 1]) pinInputs[index + 1].focus();
  }

  checkAndTriggerAutoAuth();
}

function handlePinBack(event, index) {
  if (event.key === "Backspace" && !event.target.value && index > 0) {
    const inputs = document.querySelectorAll(".pin-box");
    if (inputs[index - 1]) inputs[index - 1].focus();
  }
}

function getEnteredPin() {
  let token = "";
  document.querySelectorAll(".pin-box").forEach((input) => {
    token += input.value;
  });
  return token;
}

function checkAndTriggerAutoAuth() {
  const code = getEnteredPin();
  const loadBtn = document.getElementById("loadBtn");

  if (code.length === 6) {
    if (loadBtn) loadBtn.disabled = false;
    currentPage = 1; // Reset page context tracking
    loadAttendance();
  } else {
    if (loadBtn) loadBtn.disabled = true;
  }
}

/**
 * 📡 BACKEND DATA FETCH PIPELINE (Server-Side Pagination & Search)
 */
async function loadAttendance() {
  const orgSelectEl = document.getElementById("orgSelect");
  if (!orgSelectEl) return;

  const org = orgSelectEl.value;
  const code = getEnteredPin();

  if (!org) return alert("Please select an organization first.");
  if (code.length !== 6) return alert("Please provide the 6-digit access pin.");

  toggleLoader(true);
  try {
    let url = `${API_BASE_URI}/org/get-All/${org}/${code}?page=${currentPage}&limit=${recordsPerPage}`;

    if (currentSearchTerm) {
      url += `&search=${encodeURIComponent(currentSearchTerm)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(
        errData.message || "Unauthorized: Invalid or expired pin.",
      );
    }

    const data = await response.json();

    totalPages = data.totalPages || 1;
    currentPage = data.page || 1;

    // Unlock search functionality on successful data pull
    const searchBar = document.getElementById("userSearch");
    if (searchBar) searchBar.disabled = false;

    renderPublicCards(data.staff || []);
    renderPaginationControls();
  } catch (error) {
    console.error("Pipeline Breakdown:", error);
    alert(error.message || "Error loading attendance records.");
    const grid = document.getElementById("attendanceGrid");
    if (grid) grid.innerHTML = "";

    const paginator = document.getElementById("paginationWrapper");
    if (paginator) paginator.classList.add("hidden");
  } finally {
    toggleLoader(false);
  }
}

/**
 * INTERFACE PRESENTATION RENDERING
 */
function renderPublicCards(staffArray) {
  const container = document.getElementById("attendanceGrid");
  if (!container) return;
  container.innerHTML = "";

  if (!staffArray || staffArray.length === 0) {
    container.innerHTML = `<p style="color: #64748b; grid-column: 1/-1; text-align: center; padding: 20px;">No personnel records found.</p>`;
    return;
  }

  staffArray.forEach((person) => {
    const card = document.createElement("div");
    card.className = "person-card";
    card.innerHTML = `
      <div class="card-layout-split">
        
          <div class="avatar-placeholder">${person.name ? person.name.charAt(0).toUpperCase() : "?"}</div>
          <div>
            <h3>${person.name || "Unknown"}</h3>
            <p class="dept-text">Department: <span>${person.department || "N/A"}</span></p>
          </div>
        </div>
        <div class="meta-tag-row">
          <span class="gender-tag ${person.gender === "M" ? "male" : "female"}">
            ${person.gender === "M" ? "♂ Male" : "♀ Female"}
          </span>
        </div>
      </div>
      <button class="action-checkin-btn" onclick="requestCheckIn('${person._id}')">
        Mark Present
      </button>
    `;
    container.appendChild(card);
  });
}

function renderPaginationControls() {
  const paginator = document.getElementById("paginationWrapper");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const tracker = document.getElementById("pageTracker");

  if (!paginator) return;

  if (totalPages > 1) {
    paginator.classList.remove("hidden");
    if (tracker) tracker.innerText = `Page ${currentPage} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  } else {
    paginator.classList.add("hidden");
  }
}

function changePage(direction) {
  const targetPage = currentPage + direction;
  if (targetPage < 1 || targetPage > totalPages) return;

  currentPage = targetPage;
  loadAttendance();

  const grid = document.getElementById("attendanceGrid");
  if (grid) grid.scrollIntoView({ behavior: "smooth" });
}

/**
 * 🔍 REAL-TIME DEBOUNCED DATABASE SEARCH FILTER
 */
function filterPublicNames(e) {
  currentSearchTerm = e.target.value.trim();
  currentPage = 1;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadAttendance();
  }, 400);
}

/**
 * Request check-in dispatch sequence
 */
async function requestCheckIn(personId) {
  const code = getEnteredPin();
  if (code.length !== 6) return alert("Please provide the 6-digit access pin.");

  const orgSelectEl = document.getElementById("orgSelect");
  if (!orgSelectEl) return;
  const org = orgSelectEl.value;
  if (!org) return alert("Organization parameter context missing.");

  toggleLoader(true);
  try {
    const response = await fetch(
      `${API_BASE_URI}/org/attendance/request/${org}/${code}/${personId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Check-in request sent successfully!");
      loadAttendance();
    } else {
      alert(data.error || data.message || "Failed to submit check-in request.");
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Connection error executing check-in request.");
  } finally {
    toggleLoader(false);
  }
}
