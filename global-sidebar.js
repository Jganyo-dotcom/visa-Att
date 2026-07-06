document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 0. IMMEDIATE AVATAR SYNCHRONIZATION ENGINE (Prevents Layout Flashing)
  // ==========================================================================
  const globalHeaderAvatar =
    document.getElementById("globalHeaderAvatar") ||
    document.querySelector(".logo");

  if (globalHeaderAvatar) {
    try {
      const localUserStr = localStorage.getItem("user");
      const localUser = localUserStr ? JSON.parse(localUserStr) : null;
      const defaultAvatar =
        "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f464.svg";

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
      globalHeaderAvatar.style.opacity = "1";
    }
  }

  // ==========================================================================
  // 1. DYNAMIC DRAWER GENERATION ENGINE (Nested Accordion Dropdown Matrix)
  // ==========================================================================
  const sidebar = document.createElement("div");
  sidebar.id = "sideMenu";
  sidebar.className = "side-menu";
  sidebar.innerHTML = `
    <div class="menu-header-actions">
      <button id="closeMenuBtn" class="close-btn" aria-label="Close Navigation">&times;</button>
    </div>
    <div class="menu-links-grid">
      <button id="HomePage" class="btn-secondary standalone-home">🏠 Home</button>
      
      <div class="menu-group">
        <button class="group-trigger">🛠️ Management Panel <span class="arrow-icon">❯</span></button>
        <div class="group-content">
          <button id="mainPage" class="btn-secondary">📊 Dashboard</button>
          <button id="sessionM" class="btn-secondary">⏳ Manage Sessions</button>
          <button id="peoplePage" class="btn-secondary">🚫 Manage Absentees</button>
        </div>
      </div>

      <div class="menu-group">
        <button class="group-trigger">📝 Attendance Core <span class="arrow-icon">❯</span></button>
        <div class="group-content">
          <button id="MA" class="btn-secondary">✍️ Mark Attendance</button>
          <button id="approveAttendance" class="btn-secondary">⏳ Pending Approvals</button>
          <button id="qrCodePage" class="btn-secondary">📷 Generate QR Code</button>
          <button id="DoubleServicePage" class="btn-secondary">🔄 Double Pip</button>
        </div>
      </div>

      <div class="menu-group">
        <button class="group-trigger">📈 Records & Insights <span class="arrow-icon">❯</span></button>
        <div class="group-content">
          <button id="tend" class="btn-secondary">ℹ️ Attendance Info</button>
          <button id="followPage" class="btn-secondary">🔍 Filter Logs</button>
          <button id="analysisPage" class="btn-secondary">📊 Performance Analysis</button>
          <button id="newbee" class="btn-secondary">🗄️ New Additions</button>
          <button id="database" class="btn-secondary">🗄️ Database Archive</button>
        </div>
      </div>

      <div class="menu-group">
        <button class="group-trigger">⚙️ Settings Matrix <span class="arrow-icon">❯</span></button>
        <div class="group-content">
          <button id="profilePage" class="btn-secondary">👤 Account Profile</button>
        </div>
      </div>
    </div>
    <div class="menu-footer-actions">
      <button id="signOutBtn" class="btn-signout">🚪 Sign Out</button>
      <button id="deleteAccount" class="btn-danger">⚠️ Delete Account</button>
    </div>
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

  const globalToken = localStorage.getItem("token");
  const globalUserStr = localStorage.getItem("user");
  const globalUser = globalUserStr ? JSON.parse(globalUserStr) : null;

  const isLocalDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  // ==========================================================================
  // 3. AUTOMATED SECURITY ENFORCEMENT ENGINE
  // ==========================================================================
  if (globalToken && globalUser && globalUser.hasChangedPassword === false) {
    const currentFilename = window.location.pathname.split("/").pop();

    if (!currentFilename.includes("profile")) {
      alert(
        "🔐 Security Notice:\n\nYou must update your temporary password before accessing the system dashboard.\n\nNavigating to your settings panel now...",
      );
      window.location.href = isLocalDev ? "profile.html" : "/profile";
      return;
    }

    const lockOverlay = document.getElementById("passwordModal");
    const lockCloseBtn = document.getElementById("closeModalBtn");

    if (lockOverlay) {
      lockOverlay.style.display = "flex";
      lockOverlay.classList.add("force-security-lock");
      document.body.style.overflow = "hidden";
    }

    if (lockCloseBtn) lockCloseBtn.remove();
    if (changePasswordBtn) changePasswordBtn.remove();

    if (hamburgerBtn) {
      hamburgerBtn.disabled = true;
      hamburgerBtn.style.opacity = "0.3";
      hamburgerBtn.style.cursor = "not-allowed";
    }

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
  // 4. INTERFACE ACTIONS & NESTED ACCORDION CONTROLLERS
  // ==========================================================================

  // Accordion Logic: Expand/Collapse Menu Groups
  const groupTriggers = sidebar.querySelectorAll(".group-trigger");
  groupTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const parentGroup = trigger.parentElement;

      // Optional: Close other groups when opening a new one (Solo Accordion Style)
      sidebar.querySelectorAll(".menu-group").forEach((group) => {
        if (group !== parentGroup) group.classList.remove("open");
      });

      parentGroup.classList.toggle("open");
    });
  });

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

  const closeDropdownMenu = () => {
    sidebar.classList.remove("active");
    if (hamburgerBtn) hamburgerBtn.innerHTML = "&#9776;";
    // Collapse any left open accordion submenus when master window goes away
    sidebar
      .querySelectorAll(".menu-group")
      .forEach((group) => group.classList.remove("open"));
  };

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", closeDropdownMenu);
  }

  window.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      hamburgerBtn &&
      !sidebar.contains(e.target) &&
      e.target !== hamburgerBtn
    ) {
      closeDropdownMenu();
    }
  });

  if (
    changePasswordBtn &&
    modal &&
    (!globalUser || globalUser.hasChangedPassword !== false)
  ) {
    changePasswordBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      closeDropdownMenu();
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
    newbee: "/newbies/newbie",
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

    profileLogo.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetSrc = profileLogo.getAttribute("src");
      if (targetSrc) {
        lightboxImg.setAttribute("src", targetSrc);
        lightboxModal.classList.add("lightbox-open");
        document.body.style.overflow = "hidden";
      }
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove("lightbox-open");
      document.body.style.overflow = "";
    };

    lightboxCloseBtn.addEventListener("click", closeLightbox);
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal || e.target === lightboxImg) {
        closeLightbox();
      }
    });

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
