document.addEventListener("DOMContentLoaded", () => {
  // 1. Create the Sidebar Element Container dynamically
  const sidebar = document.createElement("div");
  sidebar.id = "sideMenu";
  sidebar.className = "side-menu";
  sidebar.innerHTML = `
    <button id="closeMenuBtn" class="close-btn" aria-label="Close Navigation">&times;</button>

<button id="mainPage" class="btn-secondary">📊 Dashboard</button>


<button id="sessionM" class="btn-secondary">⏳ Manage Sessions</button>
<button id="MA" class="btn-secondary">📝 Mark Attendance</button>
<button id="code" class="btn-secondary">📷 Mark Attendance By Scan</button>
<button id="DoubleServicePage" class="btn-secondary">🔄 Double Pip</button>

<button id="tend" class="btn-secondary">ℹ️ Attendance Info</button>
<button id="followPage" class="btn-secondary">🔍 Filter Attendance</button>
<button id="analysisPage" class="btn-secondary">📈 Analysis Of Attendance</button>
<button id="peoplePage" class="btn-secondary">🚫 Manage Absentees</button>
<button id="database" class="btn-secondary">🗄️ Database Records</button>
<button id="profilePage" class="btn-secondary">⚙️ Settings & Profile</button>
<button id="changePasswordBtn" class="btn-secondary">🔑 Change Password</button>
<button id="signOutBtn" class="btn-signout">🚪 Sign Out</button>
<button id="deleteAccount" class="btn-danger">⚠️ Delete Account</button>
  `;

  // 2. Inject it cleanly right at the top of the body execution stack
  document.body.prepend(sidebar);

  // 3. UI DOM Element Target References
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const modal = document.getElementById("passwordModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  // --- Core Functional Drawer Logic ---
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Avoid instant click-away close
      sidebar.classList.toggle("active");
      hamburgerBtn.innerHTML = sidebar.classList.contains("active") ? "&times;" : "&#9776;";
    });
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", () => {
      sidebar.classList.remove("active");
      if (hamburgerBtn) hamburgerBtn.innerHTML = "&#9776;";
    });
  }

  // Close when clicking safely outside the sidebar canvas space
  window.addEventListener("click", (e) => {
    if (sidebar.classList.contains("active") && hamburgerBtn && !sidebar.contains(e.target) && e.target !== hamburgerBtn) {
      sidebar.classList.remove("active");
      hamburgerBtn.innerHTML = "&#9776;";
    }
  });

  // --- Dynamic Shared Modal Integration Control ---
  if (changePasswordBtn && modal) {
    changePasswordBtn.addEventListener("click", () => {
      modal.style.display = "grid";
      sidebar.classList.remove("active"); // Clean step: close menu when modal opens
      if (hamburgerBtn) hamburgerBtn.innerHTML = "&#9776;";
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // --- App Page Routing Redirection Configurations ---
  const isLocalDev = 
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.protocol === "file:";

  // Central Routing Engine Control Mapping Handlers
  const routeMappings = {
    "peoplePage": "/people",
    "database": "/database",
    "profilePage": "/profile",
    "analysisPage": "/analysis",
    "code": "/qrcode",
    "tend": "/Attend",
    "MA": "/markAttendace",
    "followPage": "/GHYYK",
    "mainPage": "/admin",
    "sessionM": "/sessionManagement",
    "DoubleServicePage": "/DD"
  };

  // Global Single Page Application Route Driver Engine
  const navigateTo = (path) => {
    window.location.href = isLocalDev ? `${path}.html` : path;
  };

  Object.entries(routeMappings).forEach(([elementId, path]) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener("click", () => navigateTo(path));
    }
  });
  
  // Custom placeholders for Auth handling
const signOut = document.getElementById("signOutBtn");
if (signOut) {
  signOut.addEventListener("click", () => {
    console.log("Signing out user...");
    
    // 1. Provide immediate visual feedback to the user
    signOut.textContent = "🚪 Signing Out...";
    signOut.disabled = true;

    // 2. Clear out all auth credentials from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId"); 
    
    // If you want to purge everything at once, use: localStorage.clear();

    // 3. Optional: Add a short, smooth delay so the user sees the transition
    setTimeout(() => {
      window.location.href = "auth.html";
    }, 400); 
  });
}

  // --- Fixed: Delete Account Handler Moved Inside Lifecycle Wrapper ---
  const deleteAccountBtn = document.getElementById("deleteAccount");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      );
      if (!confirmed) return;

      try {
        // Ensure baseApi and user are defined globally or imported elsewhere before usage
        const res = await fetch(baseApi + `api/admin/${user.id}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          // Clear tokens
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Redirect to auth/login page
          window.location.href = isLocalDev ? "/auth.html" : "/auth";
        } else {
          const data = await res.json();
          alert("Error deleting account: " + data.message);
        }
      } catch (err) {
        console.error("Delete account error:", err);
        alert("Server error deleting account");
      }
    });
  }
});