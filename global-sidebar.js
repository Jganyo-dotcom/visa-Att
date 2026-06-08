document.addEventListener("DOMContentLoaded", () => {
  // 1. Create the Sidebar Element Container dynamically
  const sidebar = document.createElement("div");
  sidebar.id = "sideMenu";
  sidebar.className = "side-menu";
  sidebar.innerHTML = `
    <button id="closeMenuBtn" class="close-btn" aria-label="Close Navigation">&times;</button>
    <button id="mainPage" class="btn-secondary">Dashboard</button>
    <button id="sessionM" class="btn-secondary">Manage Sessions</button>
    <button id="peoplePage" class="btn-secondary">Manage Absentees</button>
    <button id="code" class="btn-secondary">Mark Attendance By Scan</button>
    <button id="tend" class="btn-secondary">Attendance info</button>
    <button id="MA" class="btn-secondary">Mark Attendance</button>
    <button id="database" class="btn-secondary">Database</button>
    <button id="profilePage" class="btn-secondary">Profile</button>
    <button id="analysisPage" class="btn-secondary">Analysis Of Attendance</button>
    <button id="DoubleServicePage" class="btn-secondary">Double Pip</button>
    <button id="followPage" class="btn-secondary">Filter Attendance</button>
    <button id="changePasswordBtn" class="btn-secondary">Change Password</button>
    
    <button id="signOutBtn" class="btn-signout">Sign Out</button>
    <button id="deleteAccount" class="btn-danger">Delete Account</button>
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
  // Adjust these strings if your actual filenames look slightly different
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

  Object.entries(routeMappings).forEach(([elementId, path]) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener("click", () => navigateTo(path));
    }
  });
  
  // Custom placeholders for Auth handling (Hook into your main script if needed)
  const signOut = document.getElementById("signOutBtn");
  if (signOut) {
    signOut.addEventListener("click", () => {
      console.log("Signing out user...");
      // write auth/logout logic or redirect here
    });
  }
});