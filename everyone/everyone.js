const API_BASE_URL = "http://127.0.0.1:4444/api/guest";
const API_BASE_URL = "https://attandance-app-1.onrender.com/api/guest";

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

/**
 * PIN Access Control & Input Triggers
 */

document.querySelector("#orgSelect").addEventListener("change", handleOrgChange);

function handleOrgChange() {
  const org = document.getElementById("orgSelect").value;
  const drawer = document.getElementById("authCodeWrapper");
  const loadBtn = document.getElementById("loadBtn");
  const pinInputs = document.querySelectorAll(".pin-box");

  if (org) {
    drawer.classList.add("open");
    pinInputs.forEach((i) => (i.value = ""));
    pinInputs[0].focus();
  } else {
    drawer.classList.remove("open");
    loadBtn.disabled = true;
    document.getElementById("userSearch").disabled = true;
  }
}

function handlePinStep(input, index) {
  input.value = input.value.replace(/\D/g, ""); // Digits numbers only

  if (input.value.length === 1 && index < 5) {
    document.querySelectorAll(".pin-box")[index + 1].focus();
  }

  checkAndTriggerAutoAuth();
}

function handlePinBack(event, index) {
  if (event.key === "Backspace" && !event.target.value && index > 0) {
    const inputs = document.querySelectorAll(".pin-box");
    inputs[index - 1].focus();
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
    loadBtn.disabled = false;
    currentPage = 1; // Reset page context tracking
    loadAttendance();
  } else {
    loadBtn.disabled = true;
  }
}

/**
 * 📡 BACKEND DATA FETCH PIPELINE (Server-Side Pagination & Search)
 */
async function loadAttendance() {
  const org = document.getElementById("orgSelect").value;
  const code = getEnteredPin();

  if (!org) return alert("Please select an organization first.");
  if (code.length !== 6) return alert("Please provide the 6-digit access pin.");

  toggleLoader(true);
  try {
    // Constructing the URL utilizing params and query values expected by your controller
    let url = `${API_BASE_URL}/org/get-All/${org}/${code}?page=${currentPage}&limit=${recordsPerPage}`;

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

    // Sync application states with response payload fields
    totalPages = data.totalPages || 1;
    currentPage = data.page || 1;

    // Unlock search functionality on successful data pull
    document.getElementById("userSearch").disabled = false;

    renderPublicCards(data.staff || []);
    renderPaginationControls();
  } catch (error) {
    console.error("Pipeline Breakdown:", error);
    alert(error.message || "Error loading attendance records.");
    document.getElementById("attendanceGrid").innerHTML = "";
    document.getElementById("paginationWrapper").classList.add("hidden");
  } finally {
    toggleLoader(false);
  }
}

/**
 * INTERFACE PRESENTATION RENDERING
 */
function renderPublicCards(staffArray) {
  const container = document.getElementById("attendanceGrid");
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
        <div class="identity-block">
          <div class="avatar-placeholder">${person.name.charAt(0).toUpperCase()}</div>
          <div>
            <h3>${person.name}</h3>
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

  // Only display if there are multiple pages to browse
  if (totalPages > 1) {
    paginator.classList.remove("hidden");
    tracker.innerText = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  } else {
    paginator.classList.add("hidden");
  }
}

// Handler for the pagination button actions
function changePage(direction) {
  const targetPage = currentPage + direction;
  if (targetPage < 1 || targetPage > totalPages) return;

  currentPage = targetPage;
  loadAttendance(); // Pull next dataset window frame

  // Smoothly slide view back up to grid baseline context
  document
    .getElementById("attendanceGrid")
    .scrollIntoView({ behavior: "smooth" });
}

/**
 * 🔍 REAL-TIME DEBOUNCED DATABASE SEARCH FILTER
 */
function filterPublicNames(e) {
  currentSearchTerm = e.target.value.trim();
  currentPage = 1; // Always fall back to page 1 on fresh filter adjustments

  // Debounce API requests so it doesn't slam your node instance on every single keystroke
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadAttendance();
  }, 400);
}

/**
 * Request check-in dispatch sequence
 */
async function requestCheckIn(personId) {
  const org = document.getElementById("orgSelect").value;
  if (!org) return alert("Organization parameter context missing.");

  toggleLoader(true);
  try {
    const response = await fetch(`${API_BASE_URL}/${org}/attendance/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId }),
    });

    if (response.ok) {
      alert("Check-in request sent successfully!");
    } else {
      alert("Failed to submit check-in request.");
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Connection error executing check-in request.");
  } finally {
    toggleLoader(false);
  }
}
