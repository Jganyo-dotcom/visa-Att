const baseApi = "https://attandance-app-1.onrender.com/";
const token = localStorage.getItem("token");

if (!token) {
  alert("Not authorized!");
  window.location.href = "auth.html";
}

const user = JSON.parse(localStorage.getItem("user"));
const modal = document.getElementById("changePasswordModal");
const closeBtn = document.getElementById("closeModal");
const openModalBtn = document.getElementById("openChangePassword");

// Mobile Drawer Document Nodes Mapping
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileDrawer = document.getElementById("mobileDrawer");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");
const openChangePasswordMobile = document.getElementById("openChangePasswordMobile");
const signOutBtnMobile = document.getElementById("signOutBtnMobile");

// Manage Password Enforcement View State Mechanics
if (user && user.hasChangedPassword !== true) {
  if (modal && closeBtn) {
    modal.style.display = "flex";
    closeBtn.style.display = "none";
  }
} else {
  if (modal) {
    modal.style.display = "none";
  }
}

// Universal Overlay System Close Helper Utility Function
const closeAllNavigationLayers = () => {
  if (mobileDrawer) mobileDrawer.style.display = "none";
};

// Manual Interface Window Event Bindings for Modal View States
if (openModalBtn && modal) {
  openModalBtn.addEventListener('click', () => {
    modal.style.display = "flex";
    closeAllNavigationLayers();
  });
}

if (openChangePasswordMobile && modal) {
  openChangePasswordMobile.addEventListener('click', () => {
    modal.style.display = "flex";
    closeAllNavigationLayers();
  });
}

if (closeBtn && modal) {
  closeBtn.addEventListener('click', () => modal.style.display = "none");
}

// Mobile Responsive Drawer Execution Pipeline Action Drivers
if (mobileMenuBtn && mobileDrawer) {
  mobileMenuBtn.addEventListener('click', () => mobileDrawer.style.display = "flex");
}

if (closeDrawerBtn && mobileDrawer) {
  closeDrawerBtn.addEventListener('click', () => mobileDrawer.style.display = "none");
}

// Close components on transparent back-screen container focus click event boundaries
window.addEventListener('click', (e) => {
  if (e.target === modal && user && user.hasChangedPassword === true) {
    modal.style.display = "none";
  }
  if (e.target === mobileDrawer) {
    mobileDrawer.style.display = "none";
  }
});

// Load all registered administrative system credentials entries inside the visualization map matrix
async function loadAdmins() {
  try {
    const res = await fetch(baseApi + "api/get-all-admins", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to load admins");

    const data = await res.json();
    const list = document.getElementById("adminList");
    if (!list) return;
    list.innerHTML = "";

    data.forEach((admin) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${admin.name}</td>
        <td>${admin.username}</td>
        <td>${admin.email}</td>
        <td>${admin.org}</td>
        <td>
          <button class="btn-danger" data-id="${admin._id}" data-name="${admin.name}">
            Delete
          </button>
        </td>
      `;
      list.appendChild(tr);
    });

    // Delegated safe programmatic event listener layout mapping strategy configuration
    list.querySelectorAll('.btn-danger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        deleteAdmin(id, name);
      });
    });

  } catch (err) {
    console.error(err);
    alert("Error loading admins");
  }
}

// Add new admin payload verification control flow pipeline architecture function mappings
const addAdminForm = document.getElementById("addAdminForm");
if (addAdminForm) {
  addAdminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const org = document.getElementById("org").value;

    try {
      const res = await fetch(baseApi + "api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, username, email, password, org }),
      });

      if (res.ok) {
        alert("Admin added successfully!");
        loadAdmins();
        e.target.reset();
      } else {
        const err = await res.json();
        alert(err.error || "Error adding admin");
      }
    } catch (error) {
      alert("Network communication error.");
    }
  });
}

// Sign Out Context Handling Execution Pipelines
function handleSignOut() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "auth.html";
}

const signOutBtn = document.getElementById("SignOutBtn");
if (signOutBtn) signOutBtn.addEventListener("click", handleSignOut);

if (signOutBtnMobile) signOutBtnMobile.addEventListener("click", handleSignOut);

// Change password query transformation requests execution stream blocks
const changePasswordForm = document.getElementById("changePasswordForm");
if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    const submitBtn = changePasswordForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Changing...";
    submitBtn.disabled = true;

    try {
      const response = await fetch(baseApi + `api/admin/change-password/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword: newPassword }),
      });

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
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Target entry point configuration block module execution loop driver settings rules
async function deleteAdmin(id, name) {
  try {
    const confirmed = confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmed) return;

    const res = await fetch(baseApi + `api/admin/${id}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete user");
      return;
    }

    if (data.message) {
      alert(data.message);
      loadAdmins();
    }
  } catch (err) {
    console.error("Network error deleting user:", err);
    alert("Network error!");
  }
}

// Initialization Root Execution Run Loop Entry point trigger function call
loadAdmins();