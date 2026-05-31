//const baseApi = "http://127.0.0.1:4444";
const baseApi = "https://attandance-app-1.onrender.com";

// Local State Engine Tracker
let isSessionActive = false;
let sessionId;

// DOM Cache Elements
const loader = document.getElementById("ios-loader");
const loaderText = document.getElementById("loaderText");
const sessionNameInput = document.getElementById("sessionName");
const actionBtn = document.getElementById("sessionActionBtn");
const statusBadge = document.getElementById("statusBadge");
const token = localStorage.getItem("token");

// Run immediately when page loads to check live database state
document.addEventListener("DOMContentLoaded", () => {
  syncCurrentSessionState();
});

/**
 * 1. GET Request: Asks backend if a session is currently live right now
 */
// async function syncCurrentSessionState() {
//   try {
//     const response = await fetch("/api/current-session");
//     const data = await response.json();

//     if (response.ok && data.activeSession) {
//       // If server has an open session active
//       isSessionActive = true;
//       renderUIState(true, data.sessionName);
//     } else {
//       // Server is resting or has no open session
//       isSessionActive = false;
//       renderUIState(false, "");
//     }
//   } catch (error) {
//     console.error("Failed to connect to backend context:", error);
//     // Fallback UI gracefully allows manual operation if network drops
//     renderUIState(false, "");
//   }
// }

/**
 * 2. Toggles action executions safely based on current state parameters
 */
async function handleSessionToggle() {
  if (!isSessionActive) {
    await CreateSession();
  } else {
    await CloseSession();
  }
}

/**
 * 3. POST Request: Opens a new session
 */
async function syncCurrentSessionState() {
  showLoader("Initializing local access points...");

  try {
    const response = await fetch(`${baseApi}/api/admin/check-session-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const data = await response.json();
    console.log(data);
    if (!response.ok) throw new Error(data.message || "Failed");
    if (data.isOpened) {
      isSessionActive = true;
      const title = data.title;
      sessionId = data.id;
      renderUIState(true, title);
      alert(`🎉 Success: Session ${title} is now open and taking logs.`);
    } else {
      isSessionActive = false;
      renderUIState(false, "");
    }
  } catch (err) {
    console.error(err);
    alert(`❌ network error: ${err.message}`);
  } finally {
    hideLoader();
  }
}

/**
 * 4. PATCH Request: Closes the ongoing session
 */
// async function runCloseSession() {
//   const confirmClose = confirm(
//     "Are you sure you want to lock and close the active attendance session?",
//   );
//   if (!confirmClose) return;

//   showLoader("Compiling attendance reports and finalizing records...");

//   try {
//     const response = await fetch("/api/close-session", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//     });
//     const data = await response.json();

//     if (!response.ok)
//       throw new Error(data.message || "Failed to close session cleanly.");

//     isSessionActive = false;
//     renderUIState(false, "");
//     alert("🔒 Secure: Session completed and logged successfully.");
//   } catch (err) {
//     console.error(err);
//     alert(`❌ Server Exception: ${err.message}`);
//   } finally {
//     hideLoader();
//   }
// }

/**
 * 5. State Renderer: Updates UI attributes dynamically
 */
function renderUIState(active, titleText) {
  // Clear any disabled lock configurations first
  actionBtn.removeAttribute("disabled");
  actionBtn.classList.remove("state-loading", "state-create", "state-close");

  if (active) {
    // Session is LIVE (Red Mode)
    statusBadge.textContent = "● Live Session Active";
    statusBadge.className = "status-badge is-active";

    sessionNameInput.value = titleText;
    sessionNameInput.disabled = true; // Lock down text input to prevent accidents

    actionBtn.textContent = "Close Active Session";
    actionBtn.className = "action-btn state-close";
  } else {
    // No Session Running (Green Mode)
    statusBadge.textContent = "○ Standby Mode";
    statusBadge.className = "status-badge is-inactive";

    sessionNameInput.value = "";
    sessionNameInput.disabled = false; // Allow typing strings

    actionBtn.textContent = "Open Live Session";
    actionBtn.className = "action-btn state-create";
  }
}

async function CreateSession() {
  try {
    const confirmed = window.confirm("Do you really want to open a session?");
    if (!confirmed) return;

    // ✅ Show loader
    showLoader("Opening Session...");
    const sessionNameInput = document.getElementById("sessionName");
    const title = sessionNameInput.value;
    const res = await fetch(baseApi + "/api/create-session", {
      method: "POST", // backend expects GET
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title }), // ✅ correct
    });

    const contentType = res.headers.get("Content-Type");

    if (
      contentType &&
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      )
    ) {
      // It's an Excel file → trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let filename = "attendance.xlsx";
      const disposition = res.headers.get("Content-Disposition");
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1];
      }
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return; // stop here, file downloaded
    }

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || data.error || "Failed to create session");
      console.error("Error creating session:", data);
      return;
    }

    if (data.message) {
      alert(data.message);
    }
  } catch (err) {
    console.error("Network error creating session:", err);
    alert("Network error!");
  } finally {
    // ✅ Hide loader
    hideLoader();
    await syncCurrentSessionState();
  }
}

async function CloseSession() {
  try {
    const confirmed = confirm("Session will close when you click OK?");
    if (!confirmed) {
      alert("Session close cancelled");
      return;
    }

    // ✅ Show loader
    showLoader("Compiling attendance reports and finalizing records...");

    const res = await fetch(baseApi + `/api/close-session/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to close session");
      console.error("Error closing session:", data);
      return;
    }

    if (data.message) {
      alert(data.message);
    }
  } catch (err) {
    console.error("Network error closing session:", err);
    alert("Network error!");
  } finally {
    // ✅ Hide loader
    hideLoader();
    await syncCurrentSessionState();
  }
}

function showLoader(message) {
  loaderText.textContent = message;
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}
