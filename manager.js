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

// Manage Password Enforcement View State
if (user && user.hasChangedPassword !== true) {
  if (modal && closeBtn) {
    modal.style.display = "flex"; // Changed to flex for center overlay align
    closeBtn.style.display = "none";
  }
} else {
  if (modal) {
    modal.style.display = "none";
  }
}

// Manual Toggle Event Listeners for Modal
if(openModalBtn && modal) {
  openModalBtn.addEventListener('click', () => modal.style.display = "flex");
}
if(closeBtn && modal) {
  closeBtn.addEventListener('click', () => modal.style.display = "none");
}

// Load all admins
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
  }
}

// Add new admin
document.getElementById("addAdminForm").addEventListener("submit", async (e) => {
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

// Sign out logic
const signOut = document.getElementById("SignOutBtn");
signOut.addEventListener("click", handleSignOut);

function handleSignOut() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "auth.html";
}

// Change password request pipeline
const formm = document.getElementById("changePasswordForm");
formm.addEventListener("submit", async (e) => {
  e.preventDefault();

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

// Delete admin context action
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

// Initialization Entrypoint
loadAdmins();
