//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";
console.log("loaded");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// When loading attendance, decide whether to show Level column
async function loadAttendance(page = 1, searchTerm = "") {
  try {
    const limit = 25;
    const res = await fetch(
      baseApi +
        `api/get-all?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      },
    );
    const data = await res.json();

    const container = document.getElementById("attendanceList");
    container.innerHTML = "";

    const staff = data.staff || data;

    const table = document.createElement("table");
    table.className = "attendance-table";

    // Table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Department</th>
        ${user.org === "Visa" ? "<th>Level</th>" : ""}
        <th>Contact</th>
        <th>Action</th>
        <th>Update</th>
      </tr>
    `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement("tbody");
    staff.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.department}</td>
        ${user.org === "Visa" ? `<td>${s.level}</td>` : ""}
        <td>${s.contact}</td>
        <td><button class="btn-danger" onclick="deleteUser('${s._id}', '${s.name}')">Delete</button></td>
        <td><button class="btn btn-primary" onclick="UpdateUser('${s._id}', '${s.name}', '${s.department}', '${s.level}', '${s.contact}')">Update</button></td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);

    if (data.totalPages) {
      renderAttendancePagination(data.page, data.totalPages);
    }

    currentPage = data.page;
    ;
  } catch (err) {
    console.error("Error loading attendance:", err);
  }
}

function UpdateUser(id, name, department, level, contact) {
  document.getElementById("updateId").value = id;
  document.getElementById("updateName").value = name;
  document.getElementById("updateDepartment").value = department;
  document.getElementById("updateContact").value = contact;

  const levelField = document.getElementById("updateLevel");
  const levelLabel = levelField.previousElementSibling; // the <label>

  if (user.org === "Visa") {
    levelField.value = level;
    levelField.required = true;
    levelField.style.display = "block";
    levelLabel.style.display = "block";
  } else {
    levelField.required = false;
    levelField.style.display = "none";
    levelLabel.style.display = "none";
  }

  document.getElementById("updateModal").style.display = "block";
}

document.getElementById("closeModall").addEventListener("click", () => {
  document.getElementById("updateModal").style.display = "none";
});

document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.textContent = "Updating...";
  submitBtn.disabled = true;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Not authorized!");
    window.location.href = "auth.html";
    return;
  }

  // Build updatedUser object
  const updatedUser = {
    name: document.getElementById("updateName").value,
    department: document.getElementById("updateDepartment").value,
    contact: document.getElementById("updateContact").value,
  };

  // Only include level if org is Visa
  if (user.org === "Visa") {
    updatedUser.level = document.getElementById("updateLevel").value;
  }

  const id = document.getElementById("updateId").value;

  try {
    const res = await fetch(baseApi + `api/admin/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update user");
      console.error("Error updating user:", data);
    } else {
      alert(data.message || "User updated successfully!");
      document.getElementById("updateModal").style.display = "none";
      loadAttendance();
    }
  } catch (err) {
    console.error("Network error updating user:", err);
    alert("Network error!");
  } finally {
    submitBtn.textContent = "Save Changes";
    submitBtn.disabled = false;
  }
});

async function deleteUser(id, name) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized!");
      window.location.href = "auth.html";
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete ${name} ?`);
    if (!confirmed) return;

    const res = await fetch(baseApi + `api/admin/delete/${id}`, {
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
      loadAttendance();
    }

    // reload pending list
  } catch (err) {
    console.error("Network error deleting user:", err);
    alert("Network error!");
  }
}

let currentSearch = ""
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

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");

// const modal = document.getElementById("changePasswordModal");
const openBtnDesktop = document.getElementById("changePasswordBtn");

// const closeBtn = document.getElementById("closeModal");

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

const signOut = document.getElementById("signOutBtn");
signOut.addEventListener("click", handleSignOut);

function handleSignOut() {
  // Ask three times for confirmation
  for (let i = 1; i <= 3; i++) {
    const confirmed = confirm(`(${i}/3) Are you sure you want to sign out?`);
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

const changePasswordBtn = document.getElementById("changePasswordBtn");
const modal = document.getElementById("changePasswordModal");
const closeModal = document.getElementById("closeModal");

if (changePasswordBtn && modal) {
  changePasswordBtn.addEventListener("click", () => {
    modal.style.display = "flex"; // show modal
  });
}

if (closeModal && modal) {
  closeModal.addEventListener("click", () => {
    modal.style.display = "none"; // hide modal
  });
}

// Optional: close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
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
document.getElementById("mainPage").addEventListener("click", () => {
  window.location.href = "/admin.html";
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
// if (closeBtn) {
//   closeBtn.addEventListener("click", () => {
//     modal.style.display = "none";
//   });
// }

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
  const confirmPassword = document.getElementById("newPassword").value;

  // get the submit button
  const submitBtn = formm.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Changing...";
  submitBtn.disabled = true;

  try {
    const token = localStorage.getItem("token"); // assuming you store JWT in localStorage
    const response = await fetch(
      baseApi + `api/admin/change-password/${user.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      alert("Password updated successfully!");
      modal.style.display = "none";
      handleSignOut();
    } else {
      alert(data.message || "Error updating password");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    // reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

const container = document.getElementById("attendanceList");
container.innerHTML = "";

const wrapper = document.createElement("div");
wrapper.className = "table-container";

const table = document.createElement("table");
table.className = "attendance-table";

// ... build table header and body ...

wrapper.appendChild(table);
container.appendChild(wrapper);

loadAttendance();
