// Global Endpoint Configuration
const API_BASE_URL = "https://attandance-app-1.onrender.com/api";
//const API_BASE_URL = "http://127.0.0.1:4444/api";

const token = localStorage.getItem("token");

// System State Manager Toggle Utility for Loader Spinner
function toggleLoader(show) {
  const loader = document.getElementById("loaderOverlay");
  if (!loader) return;
  if (show) {
    loader.classList.add("active");
  } else {
    loader.classList.remove("active");
  }
}

/**
 * Core Application Controller Initiation Context:
 * Fetches pending access structures from backend server.
 */
let currentPage = 1;

async function fetchAndRenderAdminDashboard(page = 1, search = "") {
  toggleLoader(true);
  try {

    const response = await fetch(
      `${API_BASE_URL}/admin/get-pending-approval?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message || "Error: Unable to fetch pending approval parameters.",
      );
      return;
    }

    let pendingList = [];
    if (data && Array.isArray(data.pending)) {
      pendingList = data.pending;
    } else if (data && Array.isArray(data.staff)) {
      pendingList = data.staff;
    } else if (Array.isArray(data)) {
      pendingList = data;
    }

    renderAdminCards(pendingList);

    // Update pagination controls
    currentPage = data.page;
    document.getElementById("pageInfo").textContent =
      `Page ${data.page} of ${data.totalPages}`;
    document.getElementById("prevBtn").disabled = !data.hasPrevPage;
    document.getElementById("nextBtn").disabled = !data.hasNextPage;
  } catch (error) {
    console.error("Admin dashboard processing problem:", error);
    alert(
      "Critical network failure. Could not connect to authorization services.",
    );
  } finally {
    toggleLoader(false);
  }
}

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim();
  fetchAndRenderAdminDashboard(1, searchTerm); // reset to page 1 when searching
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    fetchAndRenderAdminDashboard(currentPage - 1, searchInput.value.trim());
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  fetchAndRenderAdminDashboard(currentPage + 1, searchInput.value.trim());
});
/**
 * Dynamically Builds and Paints HTML Cards Grid Context Base
 * @param {Array} profiles - Target raw arrays received from API response extraction
 */
function renderAdminCards(profiles) {
  const container = document.getElementById("adminGrid");
  if (!container) return;

  container.innerHTML = ""; // Clear loader artifacts

  // Strict Array Type Checking Guard
  if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p style="font-size: 1.1rem; font-weight: 600;">All Caught Up! 🎉</p>
        <p style="margin-top: 6px; font-size: 0.85rem;">No pending check-in verifications remaining inside the pool queue.</p>
      </div>`;
    return;
  }

  profiles.forEach((person) => {
    // Graceful fallback defaults if data values are missing
    const personName = person.name || "Anonymous User";
    const department = person.department || "General Staff";
    const contact = person.contact || "N/A";
    const orgName = person.org || "Global Tenant";
    const personId = person._id;

    // Create custom wrapper mapping block element
    const card = document.createElement("div");
    card.className = "data-card";
    card.id = `card-${personId}`;

    card.innerHTML = `
  <button class="card-close-btn" onclick="handleCardDismiss('${personId}')" aria-label="Dismiss">
    &times;
  </button>

  <div class="card-info">
    <div class="card-header-row">
      <h3>${personName}</h3>
      <span class="badge">${orgName}</span>
    </div>
    <div class="meta-field">
      <span class="meta-label">Department</span>
      <span class="meta-value">${department}</span>
    </div>
    <div class="meta-field">
      <span class="meta-label">Contact Link</span>
      <span class="meta-value">${contact}</span>
    </div>
  </div>

  <button class="btn-primary" id="markMe" onclick="markPresent('${personId}', this)">
    <span>✅</span> Mark Present
  </button>
`;

    container.appendChild(card);
  });
}

/**
 * Triggers state verification update over live database network context
 * @param {string} org - Organization Name Identifier Token
 * @param {string} id - Database Document MongoDB _id Key Parameter Path
 */
async function markPresent(id, btn) {
  const session = localStorage.getItem("sessionId");
  try {
    const res = await fetch(API_BASE_URL + `/mark-present/${id}/${session}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease;
    `;

    // Circle + icon
    const circle = document.createElement("div");
    circle.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
      animation: scaleUp 0.5s ease;
    `;

    const msg = document.createElement("div");
    msg.style.cssText = `
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      text-align: center;
    `;

    if (res.ok && data.presentPerson && data.presentPerson.status === "P") {
      circle.innerHTML = "&#10004;"; // ✔
      circle.style.backgroundColor = "green";
      msg.textContent = data.message || "Marked present";
      const newBtn = document.createElement("button");
      newBtn.textContent = "Marked";
      newBtn.className = "undoPresent";
      newBtn.addEventListener("click", () => undoPresent(id, newBtn));
      addLongPressHandler(newBtn, id, "P");

      btn.replaceWith(newBtn);
    } else {
      circle.innerHTML = "&#10006;"; // ✖
      circle.style.backgroundColor = "red";
      msg.textContent = data.message || "Failed to mark attendance";
    }

    overlay.appendChild(circle);
    overlay.appendChild(msg);
    document.body.appendChild(overlay);

    // Auto-remove overlay after 2 seconds
    setTimeout(() => {
      overlay.remove();
    }, 2000);
  } catch (err) {
    console.error("Network error marking present:", err);

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease;
    `;

    const circle = document.createElement("div");
    circle.innerHTML = "&#10006;";
    circle.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: red;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
      animation: scaleUp 0.5s ease;
    `;

    const msg = document.createElement("div");
    msg.textContent = "Network error marking attendance";
    msg.style.cssText = `
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      text-align: center;
    `;

    overlay.appendChild(circle);
    overlay.appendChild(msg);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
    }, 2000);
  }
}

async function undoPresent(id, btn) {
  const session = localStorage.getItem("sessionId");
  try {
    const res = await fetch(API_BASE_URL + `/mark-absent/${id}/${session}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Marked absent");

      // Reset button state
      btn.textContent = "Present";
      btn.className = "present";

      // Clear old listeners
      btn.replaceWith(btn.cloneNode(true));
      const newBtn =
        document.querySelector("#attendanceList button.present:last-child") ||
        btn;

      // Attach markPresent handler
      newBtn.addEventListener("click", () => markPresent(id, newBtn));
      addLongPressHandler(newBtn, id, "A");

      // Remove from localStorage
      let marked = JSON.parse(localStorage.getItem("markedList") || "[]");
      marked = marked.filter((x) => x !== id);
      localStorage.setItem("markedList", JSON.stringify(marked));
    } else {
      alert(data.message || "Failed to undo attendance");
    }
  } catch (err) {
    console.error("Network error undoing attendance:", err);
    alert("Failed to undo attendance");
  }
}

function addLongPressHandler(btn, personId, status) {
  let pressTimer;
  let longPressTriggered = false;

  const startPress = () => {
    clearTimeout(pressTimer);
    longPressTriggered = false;
    pressTimer = setTimeout(() => {
      longPressTriggered = true;
      showStayedModal(personId, status, btn);
    }, 2000); // 2 seconds
  };

  const cancelPress = (e) => {
    clearTimeout(pressTimer);
    if (longPressTriggered && e.type === "mouseup") {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };

  // Desktop
  btn.addEventListener("mousedown", startPress);
  btn.addEventListener("mouseup", cancelPress);
  btn.addEventListener("mouseleave", cancelPress);

  // Mobile
  btn.addEventListener("touchstart", startPress);
  btn.addEventListener("touchend", cancelPress);
  btn.addEventListener("touchcancel", cancelPress);
}

async function handleCardDismiss(id) {
  const session = localStorage.getItem("sessionId");
  try {
    const res = await fetch(API_BASE_URL + `/admin/dismiss/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease;
    `;

    // Circle + icon
    const circle = document.createElement("div");
    circle.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
      animation: scaleUp 0.5s ease;
    `;

    const msg = document.createElement("div");
    msg.style.cssText = `
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      text-align: center;
    `;

    if (res.ok) {
      circle.innerHTML = "&#10004;"; // ✔
      circle.style.backgroundColor = "green";
      msg.textContent = data.message || "dismissed";
    } else {
      circle.innerHTML = "&#10006;"; // ✖
      circle.style.backgroundColor = "red";
      msg.textContent = data.message || "Failed ";
    }

    overlay.appendChild(circle);
    overlay.appendChild(msg);
    document.body.appendChild(overlay);

    // Auto-remove overlay after 2 seconds
    setTimeout(() => {
      overlay.remove();
    }, 2000);
    fetchAndRenderAdminDashboard();
  } catch (err) {
    console.error("Network error marking present:", err);

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease;
    `;

    const circle = document.createElement("div");
    circle.innerHTML = "&#10006;";
    circle.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: red;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
      animation: scaleUp 0.5s ease;
    `;

    const msg = document.createElement("div");
    msg.textContent = "Network error marking attendance";
    msg.style.cssText = `
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      text-align: center;
    `;

    overlay.appendChild(circle);
    overlay.appendChild(msg);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
    }, 2000);
  }
}

// Global invocation tracking on initial file load sequence event lifecycle
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderAdminDashboard();
});
