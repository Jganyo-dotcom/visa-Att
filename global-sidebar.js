document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 0. IMMEDIATE AVATAR SYNCHRONIZATION ENGINE (Prevents Layout Flashing)
  // ==========================================================================
  // Target the dynamic header profile avatar wrapper
  const globalHeaderAvatar =
    document.getElementById("globalHeaderAvatar") ||
    document.querySelector(".logo");

  if (globalHeaderAvatar) {
    try {
      // Securely pull and parse current user configurations
      const localUserStr = localStorage.getItem("user");
      const localUser = localUserStr ? JSON.parse(localUserStr) : null;

      // Default modern silhouette body placeholder image path fallback
      const defaultAvatar =
        "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f464.svg";

      // Match your data property precisely: checking for avatarUrl
      if (
        localUser &&
        localUser.avatarUrl &&
        localUser.avatarUrl.trim() !== ""
      ) {
        globalHeaderAvatar.setAttribute("src", localUser.avatarUrl);
      } else {
        globalHeaderAvatar.setAttribute("src", defaultAvatar);
      }
    } catch (err) {
      console.error(
        "Error setting dynamic profile avatar fallback routes:",
        err,
      );
    } finally {
      // Gracefully show the avatar now that properties match up smoothly
      globalHeaderAvatar.style.opacity = "1";
    }
  }

  // ==========================================================================
  // 1. DYNAMIC DRAWER GENERATION ENGINE
  // ==========================================================================
  const sidebar = document.createElement("div");
  sidebar.id = "sideMenu";
  sidebar.className = "side-menu";
  sidebar.innerHTML = `
    <button id="closeMenuBtn" class="close-btn" aria-label="Close Navigation">&times;</button>
    <button id="HomePage" class="btn-secondary">🏠 Home</button>
    <button id="mainPage" class="btn-secondary">📊 Dashboard</button>
    <button id="sessionM" class="btn-secondary">⏳ Manage Sessions</button>
    <button id="MA" class="btn-secondary">📝 Mark Attendance</button>
    <button id="approveAttendance" class="btn-secondary">📝Pending Attendance</button>
    <button id="qrCodePage" class="btn-secondary">📷 Generage code</button>
    <button id="DoubleServicePage" class="btn-secondary">🔄 Double Pip</button>
    <button id="tend" class="btn-secondary">ℹ️ Attendance Info</button>
    <button id="followPage" class="btn-secondary">🔍 Filter Attendance</button>
    <button id="newbee" class="btn-secondary">🗄️ New Additions</button>
    <button id="analysisPage" class="btn-secondary">📈 Analysis Of Attendance</button>
    <button id="peoplePage" class="btn-secondary">🚫 Manage Absentees</button>
    <button id="database" class="btn-secondary">🗄️ Database Records</button>
    <button id="profilePage" class="btn-secondary">⚙️ Settings & Profile</button>
    <button id="signOutBtn" class="btn-signout">🚪 Sign Out</button>
    <button id="deleteAccount" class="btn-danger">⚠️ Delete Account</button>
  `;

  document.body.prepend(sidebar);

  // ==========================================================================
  // 2. CORE TARGET NODE HOOK LAYOUT REFERENCES
  // ==========================================================================
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const modal = document.getElementById("passwordModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  // Fetch local identity keys securely
  const globalToken = localStorage.getItem("token");
  const globalUserStr = localStorage.getItem("user");
  const globalUser = globalUserStr ? JSON.parse(globalUserStr) : null;

  // Environment Hostname Engine Configuration Maps
  const isLocalDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  // ==========================================================================
  // 3. AUTOMATED SECURITY ENFORCEMENT ENGINE
  // ==========================================================================
  if (globalToken && globalUser && globalUser.hasChangedPassword === false) {
    const currentFilename = window.location.pathname.split("/").pop();

    // SCENARIO A: User is browsing outside the settings workspace profile loop
    if (!currentFilename.includes("profile")) {
      alert(
        "🔐 Security Notice:\n\nYou must update your temporary password before accessing the system dashboard.\n\nNavigating to your settings panel now...",
      );
      window.location.href = isLocalDev ? "profile.html" : "/profile";
      return;
    }

    // SCENARIO B: User is on the profile page -> completely freeze interface interactions
    const lockOverlay = document.getElementById("passwordModal");
    const lockCloseBtn = document.getElementById("closeModalBtn");

    if (lockOverlay) {
      lockOverlay.style.display = "flex";
      lockOverlay.classList.add("force-security-lock");
      document.body.style.overflow = "hidden"; // Freeze page background tracking
    }

    if (lockCloseBtn) lockCloseBtn.remove(); // Safely strip out close button
    if (changePasswordBtn) changePasswordBtn.remove(); // Remove repetitive background button toggles

    if (hamburgerBtn) {
      hamburgerBtn.disabled = true;
      hamburgerBtn.style.opacity = "0.3";
      hamburgerBtn.style.cursor = "not-allowed";
    }

    // Intercept outside frame click events
    window.addEventListener(
      "click",
      (e) => {
        if (e.target === lockOverlay) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true,
    );
  }

  // ==========================================================================
  // 4. STANDARD SIDEBAR INTERFACE DRAWING ACTIONS
  // ==========================================================================
  if (
    hamburgerBtn &&
    (!globalUser || globalUser.hasChangedPassword !== false)
  ) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("active");
      hamburgerBtn.innerHTML = sidebar.classList.contains("active")
        ? "&times;"
        : "&#9776;";
    });
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", () => {
      sidebar.classList.remove("active");
      if (hamburgerBtn) hamburgerBtn.innerHTML = "&#9776;";
    });
  }

  window.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      hamburgerBtn &&
      !sidebar.contains(e.target) &&
      e.target !== hamburgerBtn
    ) {
      sidebar.classList.remove("active");
      hamburgerBtn.innerHTML = "&#9776;";
    }
  });

  // Dynamic system password context hooks
  if (
    changePasswordBtn &&
    modal &&
    (!globalUser || globalUser.hasChangedPassword !== false)
  ) {
    changePasswordBtn.addEventListener("click", () => {
      modal.style.display = "flex"; // Match professional slide layouts
      sidebar.classList.remove("active");
      if (hamburgerBtn) hamburgerBtn.innerHTML = "&#9776;";
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // ==========================================================================
  // 5. SITE LOCATION NAVIGATION ROUTING MAPS
  // ==========================================================================
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
    sessionM: "/sessionManagement",
    DoubleServicePage: "/DD",
    approveAttendance: "/confirmation/c",
    pendingA: "/confirmation/c",
    qrCodePage: "/everyone/generate",
    newbee:"/newbies/newbie",
    HomePage: "/landingPage",
  };

  const navigateTo = (path) => {
    window.location.href = isLocalDev ? `${path}.html` : path;
  };

  Object.entries(routeMappings).forEach(([elementId, path]) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener("click", () => navigateTo(path));
    }
  });

  // ==========================================================================
  // 6. AUTH & SENSITIVE USER STRUCTURAL TRIGGERS
  // ==========================================================================
  const signOut = document.getElementById("signOutBtn");
  if (signOut) {
    signOut.addEventListener("click", () => {
      console.log("Signing out user...");
      signOut.textContent = "🚪 Signing Out...";
      signOut.disabled = true;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionId");

      setTimeout(() => {
        window.location.href = "auth.html";
      }, 400);
    });
  }

  const deleteAccountBtn = document.getElementById("deleteAccount");
  if (deleteAccountBtn && globalUser) {
    deleteAccountBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      );
      if (!confirmed) return;

      try {
        const baseApi = "https://attandance-app-1.onrender.com/";
        const res = await fetch(`${baseApi}api/admin/${globalUser.id}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}`,
          },
        });

        if (res.ok) {
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = isLocalDev ? "auth.html" : "/auth";
        } else {
          const data = await res.json();
          alert(
            "Error deleting account: " +
              (data.message || "Unauthorized access parameters"),
          );
        }
      } catch (err) {
        console.error("Delete account error:", err);
        alert("Server network error handling account removal request arrays.");
      }
    });
  }

  // ==========================================================================
  // 7. CIRCULAR LOGO SECURITY GUARD & PROFILE PIC LIGHTBOX CONTROLLER
  // ==========================================================================
  const profileLogo = document.querySelector(".logo");

  if (profileLogo) {
    // 1. Core Lightbox Structural Engine Generation
    const lightboxModal = document.createElement("div");
    lightboxModal.id = "profileLightbox";
    lightboxModal.className = "profile-lightbox";
    lightboxModal.innerHTML = `
      <button class="lightbox-close" aria-label="Close Preview">&times;</button>
      <img class="lightbox-content" src="" alt="Profile Target Large Scale View" />
    `;
    document.body.appendChild(lightboxModal);

    const lightboxImg = lightboxModal.querySelector(".lightbox-content");
    const lightboxCloseBtn = lightboxModal.querySelector(".lightbox-close");

    // 2. Open Event Mapping (Captures active image reference configuration state)
    profileLogo.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetSrc = profileLogo.getAttribute("src");
      if (targetSrc) {
        lightboxImg.setAttribute("src", targetSrc);
        lightboxModal.classList.add("lightbox-open");
        document.body.style.overflow = "hidden"; // Freeze tracking layers
      }
    });

    // 3. Dismiss Actions (Supports backing out on background canvas or button click)
    const closeLightbox = () => {
      lightboxModal.classList.remove("lightbox-open");
      document.body.style.overflow = ""; // Reactivate scroll interface layers
    };

    lightboxCloseBtn.addEventListener("click", closeLightbox);
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal || e.target === lightboxImg) {
        closeLightbox();
      }
    });

    // Support keyboard escape routing
    window.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        lightboxModal.classList.contains("lightbox-open")
      ) {
        closeLightbox();
      }
    });
  }
});
