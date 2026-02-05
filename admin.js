//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";
console.log("loaded");
const instructionSign = true;
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
document.addEventListener("DOMContentLoaded", () => {
  let instruction = "stop!!";

  if (user.hasChangedPassword !== true) {
    console.log(user);
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

  // Fetch pending accounts
  async function loadPending() {
    try {
      showLoader();
      const res = await fetch(baseApi + "api/admin/pending/accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const result = await res.json();
      hideLoader();
      if (!res.ok) {
        hideLoader();
        console.log(result.message || "Failed to load pending accounts");
        console.error("Error:", result);
        return;
      }

      if (result.message) {
        console.log(result.message);
      }

      const list = document.getElementById("pendingList");
      if (!list) {
        console.error("No element with id 'pendingList'");
        return;
      }
      list.innerHTML = "";

      // ✅ Use result.data because that's where the array is
      const users = result.data;

      users.forEach((u) => {
        const li = document.createElement("li");
        li.innerHTML = `
    ${u.name} (${u.username}, ${u.email})
    <button class="approve" onclick="approveUser('${u._id}')">Approve</button>
    <button class="delete" onclick="deleteUser('${u._id}')">Delete</button>
  `;
        list.appendChild(li);
      });
    } catch (err) {
      hideLoader();
      console.error("Error loading pending:", err);
    }
  }

  // expose approveUser if you rely on inline onclick
  window.approveUser = approveUser;
  window.deleteUser = deleteUser;
  const refreshBtn = document.getElementById("refreshit");
  refreshBtn.addEventListener("click", Refresh);

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

  // Attendance list
  let currentPage = 1;
  let currentSearch = ""; // keep track of search term

  async function loadAttendance(page = 1, searchTerm = "") {
    try {
      const res = await fetch(
        baseApi +
          `api/get-all?page=${page}&search=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        },
      );
      const data = await res.json();

      // Show backend message if present
      if (data.message) {
        document.getElementById("attendanceMessage").textContent = data.message;
      }

      const list = document.getElementById("attendanceList");
      list.innerHTML = "";

      const staff = data.staff || data;

      staff.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s.name + " ";

        // present/undo button
        const actionBtn = document.createElement("button");
        if (s.status === "P") {
          actionBtn.textContent = "Marked";
          actionBtn.className = "undo";
          actionBtn.addEventListener("click", () =>
            undoPresent(s._id, actionBtn),
          );
        } else {
          actionBtn.textContent = "Present";
          actionBtn.className = "present";
          actionBtn.addEventListener("click", () =>
            markPresent(s._id, actionBtn),
          );
        }

        // delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "DELETE";
        deleteBtn.className = "delete";
        deleteBtn.addEventListener("click", () =>
          deleteStaff(s._id, deleteBtn),
        );

        li.appendChild(actionBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });

      if (data.totalPages) {
        renderAttendancePagination(data.page, data.totalPages);
      }

      currentPage = data.page;
    } catch (err) {
      console.error("Error loading attendance:", err);
    }
  }

  function renderAttendancePagination(page, totalPages) {
    const container = document.getElementById("attendancePagination");
    container.innerHTML = "";

    for (let p = 1; p <= totalPages; p++) {
      const btn = document.createElement("button");
      btn.textContent = p;
      btn.className = p === page ? "active-page" : "";
      btn.onclick = () => {
        currentPage = p;
        loadAttendance(p, currentSearch);
      };
      container.appendChild(btn);
    }
  }

  // Real-time search: query backend instead of filtering DOM
  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    loadAttendance(1, currentSearch); // reset to page 1 when searching
  });

  // Initial load
  document.addEventListener("DOMContentLoaded", () => loadAttendance());

  // Approve user
  async function approveUser(id) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "auth.html";
        return;
      }

      const res = await fetch(baseApi + `api/admin/verify/${id}`, {
        method: "GET", // switched to GET
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to approve user");
        console.error("Error approving user:", data);
        return;
      }

      if (data.message) {
        alert(data.message); // show backend feedback
      }

      // reload pending list
      loadPending();
    } catch (err) {
      console.error("Network error approving user:", err);
      alert("Network error!");
    }
  }

  async function deleteUser(id) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authorized!");
        window.location.href = "auth.html";
        return;
      }

      const confirmed = confirm(
        "Are you sure you want to delete this account?",
      );
      if (!confirmed) return;

      const res = await fetch(baseApi + `api/admin/unverify/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete user");
        console.error("Error deleting user:", data);
        return;
      }

      if (data.message) {
        alert(data.message); // show backend feedback
      }

      // reload pending list
      loadPending();
    } catch (err) {
      console.error("Network error deleting user:", err);
      alert("Network error!");
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
    if (instructionSign !== true) {
      alert("close session before you can signout");
      return;
    }
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

  // Mark present
  // Mark present
  // Mark present
  // Mark present
  async function markPresent(id, btn) {
    const session = localStorage.getItem("sessionId");
    try {
      const res = await fetch(baseApi + `api/mark-present/${id}/${session}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Marked present");

        if (data.presentPerson && data.presentPerson.status === "P") {
          btn.textContent = "Marked";
          btn.className = "undo";

          // Remove any existing listeners
          btn.replaceWith(btn.cloneNode(true));
          const newBtn =
            document.querySelector("#attendanceList button.undo:last-child") ||
            btn;

          // Attach undo handler

          newBtn.addEventListener("click", () => undoPresent(id, newBtn));
          loadAttendance();
          // Save marked state
          let marked = JSON.parse(localStorage.getItem("markedList") || "[]");
          if (!marked.includes(id)) {
            marked.push(id);
            localStorage.setItem("markedList", JSON.stringify(marked));
          }
        }
      } else {
        alert(data.message || "Failed to mark attendance");
      }
    } catch (err) {
      console.error("Network error marking present:", err);
      alert("Failed to mark attendance");
    }
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
  async function Refresh() {
    console.log("hit");
    loadAttendance();
    loadLocked();
    loadPending();
    loadAbsentPeople();
  }

  document
    .getElementById("searchInputonAbsent")
    .addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll("#aabsentList li").forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(term)
          ? ""
          : "none";
      });
    });

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
      const person = {
        name: document.getElementById("name").value.toUpperCase(),
        department: document.getElementById("department").value.toUpperCase(),
        contact: document.getElementById("contact").value,
      };
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
          hideLoader();
          alert(data.message || data.error || "Failed to create person");
          console.error("Error:", data);
          return;
        }
        alert(data.message || "Person created successfully!");
        loadAttendance();
        form.reset();
      } catch (err) {
        console.error("Network error:", err);
        alert("Network error!");
      }
    });
  }

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburgerBtn.addEventListener("click", () => {
    // Toggle menu visibility
    if (mobileMenu.style.display === "flex") {
      mobileMenu.style.display = "none";
    } else {
      mobileMenu.style.display = "flex";
    }
  });

  // Optional: close menu when clicking outside
  // Close mobile menu when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target !== hamburgerBtn && !mobileMenu.contains(e.target)) {
      mobileMenu.style.display = "none";
    }
  });

  // Close modal when clicking outside, but only if user has already changed password
  window.addEventListener("click", (e) => {
    if (user.hasChangedPassword === true && e.target === modal) {
      modal.style.display = "none";
    }
  });

  const modal = document.getElementById("changePasswordModal");
  const openBtnDesktop = document.getElementById("changePasswordBtn");
  const openBtnMobile = document.getElementById("changePasswordBtnMobile");
  const closeBtn = document.getElementById("closeModal");

  // Only hide modal by default if user has already changed password
  if (user.hasChangedPassword !== true) {
    console.log("User must change password:", user);
    modal.style.display = "flex"; // show modal centered
    // hide close button so they can't dismiss
  } else {
    modal.style.display = "none"; // hide modal normally
  }

  // Open modal from desktop button
  if (openBtnDesktop) {
    openBtnDesktop.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  // Open modal from mobile button
  if (openBtnMobile) {
    openBtnMobile.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  const formm = document.getElementById("changePasswordForm");

  // Open modal from desktop button
  if (openBtnDesktop) {
    openBtnDesktop.addEventListener("click", () => {
      modal.style.display = "flex"; // use flex so it centers with your CSS
    });
  }

  // Open modal from mobile button
  if (openBtnMobile) {
    openBtnMobile.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

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
          body: JSON.stringify({ currentPassword, newPassword }),
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
        alert(data.message || "Error updating password");
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create session");
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
        instructionSign = false;
        createSessionBtn.classList.add("danger");
      }
    } catch (err) {
      console.error("Network error creating session:", err);
      alert("Network error!");
    }
  }

  async function CloseSession() {
    try {
      if (instruction !== "go ahead") {
        alert("print attendance before you close session");
        return;
      }
      const token = localStorage.getItem("token");
      const sessionId = localStorage.getItem("sessionId");

      if (!token || !sessionId) {
        alert("No active session found");
        return;
      }

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
      instructionSign = true;
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

  let currentPagee = 1;
  const limit = 5; // number of items per page

  async function loadAbsentPeople(page = 1, searchTerm = "") {
    try {
      const response = await fetch(
        baseApi +
          `api/Absents?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        },
      );

      const result = await response.json();

      const list = document.getElementById("absentList");
      list.innerHTML = "";

      result.data.forEach((person) => {
        const li = document.createElement("li");
        li.textContent = `${person.name} (${person.department}) ${person.contact}`;
        list.appendChild(li);
      });

      // Update pagination info
      document.getElementById("pageInfo").textContent =
        `Page ${result.page} of ${result.totalPages}`;

      // Enable/disable buttons
      document.getElementById("prevBtn").disabled = result.page <= 1;
      document.getElementById("nextBtn").disabled =
        result.page >= result.totalPages;

      currentPagee = result.page;
    } catch (err) {
      console.error("Error fetching absent people:", err);
    }
  }

  // Event listeners for pagination buttons
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPagee > 1) {
      loadAbsentPeople(
        currentPagee - 1,
        document.getElementById("searchInputonAbsent").value,
      );
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    loadAbsentPeople(
      currentPagee + 1,
      document.getElementById("searchInputonAbsent").value,
    );
  });

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
      instruction = "go ahead";

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

  // Real-time search
  document
    .getElementById("searchInputonAbsent")
    .addEventListener("input", (e) => {
      const term = e.target.value;
      loadAbsentPeople(1, term); // always start from page 1 when searching
    });

  // Initial load
  loadAbsentPeople();

  // Load first page on page ready
  loadAbsentPeople();

  // Initial load

  console.log("loaded");
  loadPending();
  loadLocked();
  loadAttendance();
  loadAbsentPeople();
});
