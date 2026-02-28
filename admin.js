//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
document.addEventListener("DOMContentLoaded", () => {
  if (user.org === "Teens") {
    const visaLevelsEl = document.getElementById("VisaLevels");
    if (visaLevelsEl) {
      visaLevelsEl.style.display = "none";
      visaLevelsEl.removeAttribute("required");
    }
  }

  if (user.hasChangedPassword !== true) {
    const modal = document.getElementById("changePasswordModal");
    const closeBtn = document.getElementById("closeModal");

    if (modal && closeBtn) {
      modal.style.display = "block"; // or "block" depending on your CSS
      closeBtn.style.display = "none";
    }
  } else {
    const modal = document.getElementById("changePasswordModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  function showLoader() {
    document.getElementById("loaderrOverlay").style.display = "flex";
  }

  function hideLoader() {
    document.getElementById("loaderrOverlay").style.display = "none";
  }

  document.getElementById("welcome").innerHTML = `Welcome ${user.username}`;
  console.log("loaded");

  // expose approveUser if you rely on inline onclick

  // window.deleteUser = deleteUser;
  if (document.getElementById("refreshit")) {
    const refreshBtn = document.getElementById("refreshit");
    refreshBtn.addEventListener("click", Refresh);
  }

  // Fetch locked accounts
  async function loadLocked() {
    try {
      const res = await fetch(baseApi + "api/admin/blocked/accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Error:", result);
        return;
      }

      const list = document.getElementById("lockedList");
      if (!list) {
        console.error("No element with id 'lockedList'");
        return;
      }
      list.innerHTML = "";

      // ✅ Use result.data
      result.data.forEach((u) => {
        const li = document.createElement("li");
        li.textContent = `${u.name} (${u.username}, ${u.email})`;

        const btn = document.createElement("button");
        btn.textContent = "Unblock";
        btn.className = "unblock";
        btn.addEventListener("click", () => unblockUser(u._id));

        li.appendChild(btn);
        list.appendChild(li);
      });
    } catch (err) {
      console.error("Error loading locked accounts:", err);
    }
  }

  // Unblock user
  async function unblockUser(id) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authorized!");
        window.location.href = "auth.html";
        return;
      }

      const res = await fetch(baseApi + `api/admin/unblock/${id}`, {
        method: "GET", // backend expects GET
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to unblock user");
        console.error("Error unblocking user:", data);
        return;
      }

      if (data.message) {
        alert(data.message); // show backend feedback
      }

      // reload locked accounts list
      loadLocked();
    } catch (err) {
      console.error("Network error unblocking user:", err);
      alert("Network error!");
    }
  }

  const signOutDesktop = document.getElementById("signOutBtn");
  const signOutMobile = document.getElementById("signOutBtnMobile");

  function handleSignOut() {
    // Ask three times for confirmation
    for (let i = 1; i <= 3; i++) {
      const confirmed = confirm(
        `(${i}/3) Have you printed your attendance before you clearing?`,
      );
      if (!confirmed) {
        alert("Sign out cancelled");
        return;
      }
    }

    // Only reaches here if user clicked OK all three times
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // only if you stored user info under this key
    window.location.href = "/auth.html"; // redirect to login or home
  }

  if (signOutDesktop) {
    signOutDesktop.addEventListener("click", handleSignOut);
  }

  if (signOutMobile) {
    signOutMobile.addEventListener("click", handleSignOut);
  }

  // deleteStaff.js

  async function deleteStaff(staffId, btn) {
    try {
      // Get token from localStorage (or wherever you store it after login)
      const token = localStorage.getItem("token");

      const response = await fetch(baseApi + `api/admin/delete/${staffId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // attach token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Failed to delete staff: " + errorData.message);
        return;
      }

      // If successful, remove the staff item from the UI
      btn.parentElement.remove();
      alert("Staff deleted successfully");
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Something went wrong while deleting staff");
    }
  }

  // Undo present
  async function undoPresent(id, btn) {
    const session = localStorage.getItem("sessionId");
    try {
      const res = await fetch(baseApi + `api/mark-absent/${id}/${session}`, {
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

  // Mark all present

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const form = document.getElementById("createPersonForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authorized!");
        window.location.href = "auth.html";
        return;
      }

      // Read contact inside the submit handler

      const person = {
        name: capitalise(document.getElementById("name").value),
        department: capitalise(document.getElementById("department").value),
        gender: document.getElementById("gender").value,
      };
      const contact = document.getElementById("contact").value.trim();

      if (contact.length > 0) {
        person.contact = contact;
      }

      if (user.org !== "Teens") {
        const visaLevelsEl = document.getElementById("VisaLevels");
        if (visaLevelsEl) {
          person.level = visaLevelsEl.value;
        }
      }

      try {
        showLoader();
        const res = await fetch(baseApi + "api/create-person", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(person),
        });
        const data = await res.json();
        hideLoader();
        if (!res.ok) {
          alert(data.message || data.error || "Failed to create person");
          console.error("Error:", data);
          return;
        }
        alert(data.message || "Person created successfully!");
        form.reset();
      } catch (err) {
        console.error("Network error:", err);
        alert("Network error!");
      }
    });
  }

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenuBtn = document.getElementById("closeMenuBtn");

  const modal = document.getElementById("changePasswordModal");
  const openBtnDesktop = document.getElementById("changePasswordBtn");

  const closeBtn = document.getElementById("closeModal");

  // --- Side Menu Logic ---
  hamburgerBtn.addEventListener("click", () => {
    sideMenu.classList.toggle("active");

    // Toggle hamburger icon ↔ X
    if (sideMenu.classList.contains("active")) {
      hamburgerBtn.innerHTML = "&times;"; // X
    } else {
      hamburgerBtn.innerHTML = "&#9776;"; // Hamburger
    }
  });

  // Close menu when clicking the X inside
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", () => {
      sideMenu.classList.remove("active");
      hamburgerBtn.innerHTML = "&#9776;";
    });
  }

  // Close menu when clicking outside
  window.addEventListener("click", (e) => {
    if (!sideMenu.contains(e.target) && e.target !== hamburgerBtn) {
      sideMenu.classList.remove("active");
      hamburgerBtn.innerHTML = "&#9776;";
    }
  });

  // --- Modal Logic ---
  if (user.hasChangedPassword !== true) {
    console.log("User must change password:", user);
    modal.style.display = "flex"; // force modal open
    if (closeBtn) closeBtn.style.display = "none"; // hide close button
  } else {
    modal.style.display = "none";
  }

  // Open modal from desktop button
  if (openBtnDesktop) {
    openBtnDesktop.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Close modal when clicking outside, but only if user has already changed password
  window.addEventListener("click", (e) => {
    if (user.hasChangedPassword === true && e.target === modal) {
      modal.style.display = "none";
    }
  });

  const formm = document.getElementById("changePasswordForm");

  // Close when clicking outside modal

  const deleteAccountBtn = document.getElementById("deleteAccount");

  deleteAccountBtn.addEventListener("click", async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      // Call backend route
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
        localStorage.removeItem("user"); // if you stored user info

        // Redirect to auth/login page
        window.location.href = "/auth.html";
      } else {
        const data = await res.json();
        alert("Error deleting account: " + data.message);
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Server error deleting account");
    }
  });

  formm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    try {
      const token = localStorage.getItem("token"); // assuming you store JWT in localStorage
      showLoader();
      const response = await fetch(
        baseApi + `api/admin/change-password/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();
      hideLoader();
      if (response.ok) {
        alert("Password updated successfully!");
        modal.style.display = "none";
        handleSignOut();
      } else {
        hideLoader();
        alert(data.message || data.error || "Error updating password");
      }
    } catch (err) {
      hideLoader();
      console.error(err);
      alert("Something went wrong");
    }
  });

  const createSessionBtn = document.getElementById("createSessionBtn");

  // initialize button state based on localStorage
  if (localStorage.getItem("sessionId")) {
    createSessionBtn.textContent = "Close Session";
    createSessionBtn.classList.add("danger");
  } else {
    createSessionBtn.textContent = "✨ Create Session ✨";
  }

  createSessionBtn.addEventListener("click", async () => {
    if (createSessionBtn.textContent === "✨ Create Session ✨") {
      await CreateSession();
    } else {
      CloseSession();
    }
  });

  async function CreateSession() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authorized!");
        window.location.href = "auth.html";
        return;
      }

      const res = await fetch(baseApi + "api/create-session", {
        method: "GET", // backend expects GET
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      // Check if response is a file (Excel) or JSON
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

        // Use filename from headers if available
        const disposition = res.headers.get("Content-Disposition");
        let filename = "attendance.xlsx";
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

      // Otherwise, parse as JSON
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Failed to create session");
        console.error("Error creating session:", data);
        return;
      }

      if (data.message) {
        alert(data.message);
      }

      if (data.newSession?._id) {
        localStorage.setItem("sessionId", data.newSession._id);

        // ✅ toggle button text and style
        createSessionBtn.textContent = "Close Session";

        createSessionBtn.classList.add("danger");
      }
    } catch (err) {
      console.error("Network error creating session:", err);
      alert(err);
      alert("Network error!");
    }
  }

  async function CloseSession() {
    try {
      const token = localStorage.getItem("token");
      const sessionId = localStorage.getItem("sessionId");

      if (!token || !sessionId) {
        alert("No active session found");
        return;
      }

      // Ask three times for confirmation
      for (let i = 1; i <= 3; i++) {
        const confirmed = confirm(
          `(${i}/3) Have you printed your attendance before you clearing?`,
        );
        if (!confirmed) {
          alert("Session close cancelled");
          return;
        }
      }

      // Only reaches here if user clicked OK all three times
      const res = await fetch(baseApi + `api/close-session/${sessionId}`, {
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

      // ✅ Clear localStorage and toggle button text
      localStorage.removeItem("sessionId");
      console.log("Session cleared from localStorage");

      createSessionBtn.textContent = "✨ Create Session ✨";
      createSessionBtn.classList.remove("danger");
    } catch (err) {
      console.error("Network error closing session:", err);
      alert("Network error!");
    }
  }

  document.getElementById("printBtn").addEventListener("click", async () => {
    try {
      const session = localStorage.getItem("sessionId");
      const response = await fetch(
        baseApi + `api/admin/export-attendance/${session}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Convert response to blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Use filename from backend headers
      const disposition = response.headers.get("Content-Disposition");
      let filename = "attendance.xlsx";
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1];
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading attendance:", err);
      alert("Failed to download attendance file");
    }
  });

  document.getElementById("staffPage").addEventListener("click", () => {
    console.log("ha");
    window.location.href = "/staffManagement.html";
  });

  document.getElementById("peoplePage").addEventListener("click", () => {
    window.location.href = "/people.html";
  });

  document.getElementById("database").addEventListener("click", () => {
    window.location.href = "/database.html";
  });
  document.getElementById("profilePage").addEventListener("click", () => {
    window.location.href = "/profile.html";
  });
  document.getElementById("analysisPage").addEventListener("click", () => {
    window.location.href = "/analysis.html";
  });
  document.getElementById("code").addEventListener("click", () => {
    window.location.href = "/qrcode.html";
  });
  document.getElementById("tend").addEventListener("click", () => {
    window.location.href = "/Attend.html";
  });
  document.getElementById("MA").addEventListener("click", () => {
    window.location.href = "/markAttendace.html";
  });
});
