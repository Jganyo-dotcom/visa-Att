// Global Endpoint Configuration
const API_BASE_URL = "https://attandance-app-1.onrender.com";

// System State Manager Toggle Utility for Loader Spinner
function toggleLoader(show) {
  const loader = document.getElementById("loaderOverlay");
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
async function fetchAndRenderAdminDashboard() {
  toggleLoader(true);
  try {
    const token = localStorage.getItem("token"); 
    
    const response = await fetch(`${API_BASE_URL}/admin/get-pending-approval`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Error: Unable to fetch pending approval parameters.");
      return;
    }

    const pendingList = data.pending || data;
    renderAdminCards(pendingList);

  } catch (error) {
    console.error("Admin dashboard processing problem:", error);
    alert("Critical network failure. Could not connect to authorization services.");
  } finally {
    toggleLoader(false);
  }
}

/**
 * Dynamically Builds and Paints HTML Cards Grid Context Base
 * @param {Array} profiles - Target raw arrays received from API response extraction
 */
function renderAdminCards(profiles) {
  const container = document.getElementById("adminGrid");
  container.innerHTML = ""; // Clear loader artifacts

  if (!profiles || profiles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p style="font-size: 1.1rem; font-weight: 600;">All Caught Up! 🎉</p>
        <p style="margin-top: 6px; font-size: 0.85rem;">No pending check-in verifications remaining inside the pool queue.</p>
      </div>`;
    return;
  }

  profiles.forEach(person => {
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
      <button class="btn-primary" onclick="markPersonPresent('${orgName}', '${personId}')">
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
async function markPersonPresent(org, id) {
  toggleLoader(true);
  try {
    const token = localStorage.getItem("token");
    
    // Calls the dynamic organization endpoint path structure securely
    const response = await fetch(`${API_BASE_URL}/admin/${org}/mark-present/${id}`, {
      method: "PATCH", 
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ submitted: true })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not successfully verify user attendance parameters.");
    }

    // Interactive UI cleanup block loop context
    const targetedCard = document.getElementById(`card-${id}`);
    if (targetedCard) {
      // Transition look to green-out verification state confirmation visually
      const button = targetedCard.querySelector(".btn-primary");
      button.style.background = "linear-gradient(135deg, #10b981, #059669)";
      button.style.color = "#ffffff";
      button.style.boxShadow = "none";
      button.disabled = true;
      button.innerHTML = "✓ Marked Present OK";

      // Fade element out of view smoothly after a tiny visual confirmation delay
      setTimeout(() => {
        targetedCard.style.opacity = "0";
        targetedCard.style.transform = "scale(0.9)";
        setTimeout(() => {
          targetedCard.remove();
          // Recheck layout context to paint alternative placeholder state UI if array length hits 0
          const remainingCards = document.querySelectorAll(".data-card");
          if (remainingCards.length === 0) {
            renderAdminCards([]);
          }
        }, 300);
      }, 800);
    }

  } catch (error) {
    console.error("Attendance checking assignment tracking problem:", error);
    alert(error.message || "Network request rejected by server application layers.");
  } finally {
    toggleLoader(false);
  }
}

// Global invocation tracking on initial file load sequence event lifecycle
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderAdminDashboard();
});