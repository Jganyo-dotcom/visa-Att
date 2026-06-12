// Global Endpoint Configuration
const API_BASE_URL = "https://medsec.onrender.com/api";

// Local state caching arrays
let allProfilesCache = [];

/**
 * Global Loader Utility
 */
function toggleLoader(show) {
  const overlay = document.getElementById("loaderOverlay");
  if (!overlay) return;
  if (show) {
    overlay.classList.add("active");
  } else {
    overlay.classList.remove("active");
  }
}

/**
 * PHASE 1: Public Interface Logic Methods
 */
async function fetchAndRenderPublicProfiles() {
  toggleLoader(true);
  try {
    // Adjust endpoint paths to match your custom router setup
    const response = await fetch(`${API_BASE_URL}/people`);
    const data = await response.json();

    allProfilesCache = data.people || data;
    renderPublicCards(allProfilesCache);
  } catch (error) {
    console.error("Failed pulling directory records:", error);
  } finally {
    toggleLoader(false);
  }
}

function renderPublicCards(items) {
  const container = document.getElementById("attendanceGrid");
  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p style="color:#64748b;">No personnel match criteria.</p>`;
    return;
  }

  items.forEach((person) => {
    const card = document.createElement("div");
    card.className = "data-card";
    card.innerHTML = `
      <div class="card-info">
        <h3>${person.name}</h3>
        <p>Department: <strong>${person.department}</strong></p>
        <p>Level: ${person.level || person.VisaLevels || "N/A"}</p>
        <span class="badge">${person.gender === "M" ? "Male" : "Female"}</span>
      </div>
      <button class="btn-primary" onclick="requestCheckIn('${person._id || person.id}')">
        Request Present
      </button>
    `;
    container.appendChild(card);
  });
}

function filterPublicNames(e) {
  const term = e.target.value.toLowerCase().trim();
  if (!term) {
    renderPublicCards(allProfilesCache);
    return;
  }

  const filtered = allProfilesCache.filter((p) =>
    p.name.toLowerCase().includes(term),
  );
  renderPublicCards(filtered);
}

async function requestCheckIn(personId) {
  toggleLoader(true);
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId }),
    });

    if (response.ok) {
      alert(
        "Check-in request sent successfully! Please wait for admin approval.",
      );
    } else {
      alert("Failed submitting request target.");
    }
  } catch (error) {
    console.error("Submission anomaly:", error);
  } finally {
    toggleLoader(false);
  }
}

/**
 * PHASE 2: Admin Dashboard Logic Methods
 */
async function fetchAndRenderAdminDashboard() {
  toggleLoader(true);
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/pending`);
    const data = await response.json();

    const pendingList = data.pending || data;
    renderAdminCards(pendingList);
  } catch (error) {
    console.error("Admin dashboard processing problem:", error);
  } finally {
    toggleLoader(false);
  }
}

function renderAdminCards(items) {
  const container = document.getElementById("adminGrid");
  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p style="color:#64748b;">No outstanding check-in requests.</p>`;
    return;
  }

  items.forEach((record) => {
    const isMarked = record.status === "Marked";
    const card = document.createElement("div");
    card.className = "data-card";
    card.innerHTML = `
      <div class="card-info">
        <h3>${record.personName || record.name}</h3>
        <p>Department: <strong>${record.department}</strong></p>
        <p>Status: <span style="color:${isMarked ? "#10b981" : "#f59e0b"}">${record.status || "Pending"}</span></p>
      </div>
      <button class="btn-action ${isMarked ? "btn-unmark" : "btn-primary"}" 
              onclick="toggleStatus('${record._id || record.id}', '${record.status}')">
        ${isMarked ? "↩️ Unmark" : "✅ Confirm Present"}
      </button>
    `;
    container.appendChild(card);
  });
}

async function toggleStatus(recordId, currentStatus) {
  toggleLoader(true);
  const nextStatus = currentStatus === "Marked" ? "Pending" : "Marked";

  try {
    const response = await fetch(`${API_BASE_URL}/attendance/toggle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId, status: nextStatus }),
    });

    if (response.ok) {
      // Re-fetch the updated state values from your cluster nodes
      await fetchAndRenderAdminDashboard();
    } else {
      alert("Could not update record parameters.");
    }
  } catch (error) {
    console.error("Admin toggle update link issue:", error);
  } finally {
    toggleLoader(false);
  }
}
