//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";
console.log("loaded");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
const modal = document.getElementById("changePasswordModal");

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
// Load all admins
async function loadAdmins() {
  try {
    const res = await fetch(baseApi + "api/get-all-admins", {
      method: "GET", // use GET for fetching
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to load admins");
    }

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
document
  .getElementById("addAdminForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const org = document.getElementById("org").value;

    const res = await fetch(baseApi + "api/admin/create", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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
  });

const signOut = document.getElementById("SignOutBtn");
signOut.addEventListener("click", handleSignOut);

function handleSignOut() {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // only if you stored user info under this key
  window.location.href = "/auth.html"; // redirect to login or home
}

const formm = document.getElementById("changePasswordForm");

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

// Delete admin
async function deleteAdmin(id, name) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized!");
      window.location.href = "auth.html";
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete ${name} ?`);
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
      console.error("Error deleting user:", data);
      return;
    }

    if (data.message) {
      alert(data.message); // show backend feedback
      loadAdmins();
    }

    // reload pending list
  } catch (err) {
    console.error("Network error deleting user:", err);
    alert("Network error!");
  }
}

// Initial load
loadAdmins();
