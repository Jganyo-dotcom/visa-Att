const baseApi = "https://onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  alert("Not authorized!");
  window.location.href = "auth.html";
}

const user = JSON.parse(localStorage.getItem("user"));

// Capture DOM Modal references
const pwdModal = document.getElementById("changePasswordModal");
const closePwdBtn = document.getElementById("closeModal");
const openPwdBtn = document.getElementById("openChangePassword");

const signOutModal = document.getElementById("signOutModal");
const openSignOutBtn = document.getElementById("openSignOutModal");
const closeSignOutBtn = document.getElementById("closeSignOutModal");
const confirmSignOutBtn = document.getElementById("confirmSignOutBtn");

/* --- Global Loader Utilities --- */
function showLoader() {
  const loader = document.getElementById("loaderrOverlay");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("loaderrOverlay");
  if (loader) loader.style.display = "none";
}

/* --- Password Enforcement View Configuration --- */
if (user && user.hasChangedPassword !== true) {
  if (pwdModal && closePwdBtn) {
    pwdModal.style.display = "flex";
    closePwdBtn.style.display = "none";
  }
} else {
  if (pwdModal) pwdModal.style.display = "none";
}

/* --- Modal View Event Triggers --- */
if (openPwdBtn && pwdModal) {
  openPwdBtn.addEventListener('click', () => pwdModal.style.display = "flex");
}
if (closePwdBtn && pwdModal) {
  closePwdBtn.addEventListener('click', () => pwdModal.style.display = "none");
}

if (openSignOutBtn && signOutModal) {
  openSignOutBtn.addEventListener('click', () => signOutModal.style.display = "flex");
}
if (closeSignOutBtn && signOutModal) {
  closeSignOutBtn.addEventListener('click', () => signOutModal.style.display = "none");
}

// Close modals instantly if user clicks black space background overlay
window.addEventListener('click', (e) => {
  if (e.target === pwdModal && user && user.hasChangedPassword === true) pwdModal.style.display = "none";
  if (e.target === signOutModal) signOutModal.style.display = "none";
});

/* --- Remote REST Actions --- */
async function loadAdmins() {
  showLoader();
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
    list.innerHTML = "";

    data.forEach((admin) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${admin.name}</td>
        <td>${admin.username}</td>
        <td>${admin.email}</td>
        <td>${admin.org}</td>
        <td>
          <button class="btn-danger" onclick="deleteAdmin('${admin._id}','${admin.name}')">
            Delete
          </button>
        </td>
      `;
      list.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert("Error loading admins");
  } finally {
    hideLoader();
  }
}

// Add new admin
document.getElementById("addAdminForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();
  
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
  } finally {
    hideLoader();
  }
});

/* --- Sign Out Workflow --- */
if (confirmSignOutBtn) {
  confirmSignOutBtn.addEventListener("click", handleSignOut);
}

function handleSignOut() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "auth.html";
}

/* --- Password Form Handler --- */
const formm = document.getElementById("changePasswordForm");
formm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  const submitBtn = formm.querySelector("button[type='submit']");
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
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Password updated successfully!");
      pwdModal.style.display = "none";
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
    hideLoader();
  }
});

/* --- Delete Action --- */
async function deleteAdmin(id, name) {
  try {
    const confirmed = confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmed) return;

    showLoader();
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
  } finally {
    hideLoader();
  }
}

// Initial entry trigger execution
loadAdmins();
