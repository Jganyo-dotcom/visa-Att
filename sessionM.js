//const baseApi = "http://127.0.0.1:4444";
const baseApi = "https://attandance-app-1.onrender.com";
const token = localStorage.getItem("token");

const user = JSON.parse(localStorage.getItem("user"));
if (user.avatarUrl && user.avatarUrl !== "") {
  document.querySelector(".logo").src = user.avatarUrl;
}

// Local State Engine Tracker
let isSessionActive = false;
let sessionId;

// Global Single Page Application Route Driver Engine
const navigateTo = (path) => {
  window.location.href = isLocalDev ? `${path}.html` : path;
};

// Detects execution context variables safely
const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.protocol === "file:";

// Central Routing Engine Control Mapping Handlers
const routeMappings = {
  peoplePage: "/people",
  database: "/database",
  profilePage: "/profile",
  analysisPage: "/analysis",
  code: "/qrcode",
  tend: "/Attend",
  MA: "/markAttendace",
  followPage: "/GHYYK",
  mainPage: "/admin",
  DoubleServicePage: "/DD",
};

Object.entries(routeMappings).forEach(([elementId, path]) => {
  const el = document.getElementById(elementId);
  if (el) {
    el.addEventListener("click", () => navigateTo(path));
  }
});

// DOM Cache Elements
const loader = document.getElementById("ios-loader");
const loaderText = document.getElementById("loaderText");
const sessionNameInput = document.getElementById("sessionName");
const actionBtn = document.getElementById("sessionActionBtn");
const statusBadge = document.getElementById("statusBadge");

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

// const hamburgerBtn = document.getElementById("hamburgerBtn");
// const sideMenu = document.getElementById("sideMenu");
// const closeMenuBtn = document.getElementById("closeMenuBtn");

// // Modal variables pointing safely to the modal DOM elements
// const openBtnDesktop = document.getElementById("changePasswordBtn");
// const modal = document.getElementById("passwordModal");
// const closeModalBtn = document.getElementById("closeModalBtn");

// // Off-canvas Side Drawer Drawer Event Binding Logic
// if (hamburgerBtn && sideMenu) {
//   hamburgerBtn.addEventListener("click", () => {
//     sideMenu.classList.toggle("active");
//     if (sideMenu.classList.contains("active")) {
//       hamburgerBtn.innerHTML = "&times;";
//     } else {
//       hamburgerBtn.innerHTML = "&#9776;";
//     }
//   });
// }

// if (closeMenuBtn && sideMenu && hamburgerBtn) {
//   closeMenuBtn.addEventListener("click", () => {
//     sideMenu.classList.remove("active");
//     hamburgerBtn.innerHTML = "&#9776;";
//   });
// }

// window.addEventListener("click", (e) => {
//   if (sideMenu && hamburgerBtn && !sideMenu.contains(e.target) && e.target !== hamburgerBtn) {
//     sideMenu.classList.remove("active");
//     hamburgerBtn.innerHTML = "&#9776;";
//   }
// });

// // Modal Open Trigger Event Listeners
// if (openBtnDesktop && modal) {
//   openBtnDesktop.addEventListener("click", () => {
//     modal.style.display = "grid"; // Switch to grid/flex to display your slide-modal correctly
//     sideMenu.classList.remove("active"); // Clean UI step: shut menu drawer when modal opens
//     if (hamburgerBtn) hamburgerBtn.innerHTML = "&#9776;";
//   });
// }

// if (closeModalBtn && modal) {
//   closeModalBtn.addEventListener("click", () => {
//     modal.style.display = "none";
//   });
// }

// window.addEventListener("click", (e) => {
//   if (modal && e.target === modal) {
//     modal.style.display = "none";
//   }
// });

async function generateAccessCode() {
  const display = document.getElementById("generatedCodeDisplay");

  // Show loader
  document.getElementById("ios-loader").classList.add("active");
  document.getElementById("loaderText").innerText = "Generating new code...";

  try {
    const response = await fetch(`${baseApi}/api/admin/generate-code`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to generate code");
    }

    const data = await response.json();
    display.innerHTML = "";
    display.innerText = `New Code: ${data.code} (expires ${new Date(
      data.expiresAt,
    ).toLocaleString()})`;
  } catch (err) {
    console.error("Error generating code:", err);
    display.innerText = "Error generating code.";
  } finally {
    document.getElementById("ios-loader").classList.remove("active");
  }
}

async function displayAccessCode() {
  const display = document.getElementById("generatedCodeDisplay");

  // Show loader
  document.getElementById("ios-loader").classList.add("active");
  document.getElementById("loaderText").innerText =
    "Finding existing code ......";

  try {
    const response = await fetch(`${baseApi}/api/admin/get-existing-code`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Show backend message if expired or not found
      display.innerHTML = "";
      display.innerText = `❌ ${data.message || data.error || "Failed to get code"}`;
      return;
    }

    // If code exists and is valid
    display.innerHTML = "";
    display.innerText = `New Code: ${data.code} (expires ${new Date(
      data.expiresAt,
    ).toLocaleString()})`;
  } catch (err) {
    console.error("Error finding code:", err);
    display.innerText = "Error finding code.";
  } finally {
    document.getElementById("ios-loader").classList.remove("active");
  }
}

displayAccessCode();

function showLoader(message) {
  loaderText.textContent = message;
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}
