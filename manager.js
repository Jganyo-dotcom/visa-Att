const baseApi = "https://attandance-app-1.onrender.com/";
const token = localStorage.getItem("token");

if (!token) {
  alert("Not authorized!");
  window.location.href = "auth.html";
}

let user = JSON.parse(localStorage.getItem("user"));

// Capture DOM Modal references
const pwdModal = document.getElementById("changePasswordModal");
const closePwdBtn = document.getElementById("closeModal");
const openPwdBtn = document.getElementById("openChangePassword");

const signOutModal = document.getElementById("signOutModal");
const openSignOutBtn = document.getElementById("openSignOutModal");
const closeSignOutBtn = document.getElementById("closeSignOutModal");
const confirmSignOutBtn = document.getElementById("confirmSignOutBtn");

// New: Mobile Menu Drawer DOM Elements
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileDrawer = document.getElementById("mobileDrawer");
const closeDrawer = document.getElementById("closeDrawer");
const drawerUpdateDetailsBtn = document.getElementById("drawerUpdateDetailsBtn");
const drawerChangePasswordBtn = document.getElementById("drawerChangePasswordBtn");
const drawerSignOutBtn = document.getElementById("drawerSignOutBtn");

// New: Profile Details Modal DOM Elements
const updateDetailsModal = document.getElementById("updateDetailsModal");
const closeDetailsModalBtn = document.getElementById("closeDetailsModal");
const updateDetailsForm = document.getElementById("updateDetailsForm");

/* --- Hydrate Base Admin State Profiles --- */
function setupProfileFields() {
  if (!user) return;
  // Dynamic header setup string mapping
  const welcomeText = document.getElementById("welcome");
  if (welcomeText) welcomeText.textContent = `Super Admin Panel (${user.name || "Manager"})`;

  // Hydrate the fields inside the dynamic profile update configuration modal
  const pName = document.getElementById("profileName");
  const pUser = document.getElementById("profileUsername");
  const pEmail = document.getElementById("profileEmail");

  if (pName) pName.value = user.name || "";
  if (pUser) pUser.value = user.username || "";
  if (pEmail) pEmail.value = user.email || "";
}
setupProfileFields();

/* --- Global Loader Utilities --- */
function showLoader() {
  const loader = document.getElementById("loaderrOverlay");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("loaderrOverlay");
  if (loader) loader.style.display = "none";
}

/* --- Mobile Sliding Drawer Actions --- */
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileDrawer.classList.add("open");
    document.body.style.overflow = "hidden";
  });
}

const hideMobileDrawer = () => {
  mobileDrawer.classList.remove("open");
  document.body.style.overflow = "";
};

if (closeDrawer) closeDrawer.addEventListener("click", hideMobileDrawer);

/* --- Synchronized Overlay Control Core Mapping --- */
// Open Change Password Modal
const triggerPasswordModalOpen = () => {
  hideMobileDrawer();
  pwdModal.style.display = "flex";
};
if (openPwdBtn) openPwdBtn.addEventListener("click", triggerPasswordModalOpen);
if (drawerChangePasswordBtn) drawerChangePasswordBtn.addEventListener("click", triggerPasswordModalOpen);

if (closePwdBtn) {
  closePwdBtn.addEventListener("click", () => {
    pwdModal.style.display = "none";
  });
}

// Open Sign Out Modal
const triggerSignOutModalOpen = () => {
  hideMobileDrawer();
  signOutModal.style.display = "flex";
};
if (openSignOutBtn) openSignOutBtn.addEventListener("click", triggerSignOutModalOpen);
if (drawerSignOutBtn) drawerSignOutBtn.addEventListener("click", triggerSignOutModalOpen);

if (closeSignOutBtn) {
  closeSignOutBtn.addEventListener("click", () => {
    signOutModal.style.display = "none";
  });
}

// Open Update Profile Details Modal
const triggerUpdateModalOpen = () => {
  hideMobileDrawer();
  setupProfileFields(); // Refresh modal inputs with latest cached local state values
  updateDetailsModal.style.display = "flex";
};
if (drawerUpdateDetailsBtn) drawerUpdateDetailsBtn.addEventListener("click", triggerUpdateModalOpen);

if (closeDetailsModalBtn) {
  closeDetailsModalBtn.addEventListener("click", () => {
    updateDetailsModal.style.display = "none";
  });
}

// Global window overlay modal boundary backdrop clicks dismissal framework mapping
window.addEventListener("click", (e) => {
  if (e.target === pwdModal) pwdModal.style.display = "none";
  if (e.target === signOutModal) signOutModal.style.display = "none";
  if (e.target === updateDetailsModal) updateDetailsModal.style.display = "none";
  if (e.target === mobileDrawer) hideMobileDrawer();
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
          <button class="btn-danger" onclick="transform('${admin._id}','${admin.name}')">
            Delete
          </button>
        </td>
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

/* --- Update Profile Data Form Actions Workflow --- */
if (updateDetailsForm) {
  updateDetailsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoader();

    const updatedFields = {
      name: document.getElementById("profileName").value.trim(),
      username: document.getElementById("profileUsername").value.trim(),
      email: document.getElementById("profileEmail").value.trim(),
    };

    const submitBtn = updateDetailsForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Saving Profile...";
    submitBtn.disabled = true;

    try {
      // Accessing backend route template matrix mapping arrays cleanly
      const res = await fetch(`${baseApi}api/update/me/${user.id || user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile settings.");
      }

      // Merge data update directly back into memory cache structure 
      user = { ...user, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(user));

      // Refresh headers and form representations
      setupProfileFields();
      updateDetailsModal.style.display = "none";
      alert("🎉 Profile metadata structural updates synced in-place completely!");

    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred updating user variables tracking maps.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      hideLoader();
    }
  });
}

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
    const response = await fetch(baseApi + `api/admin/change-password/${user.id || user._id}`, {
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

/* --- Transform Admin Password Status Action --- */
async function transform(id, name) {
  try {
    // 1. Prompt the Super Admin for authorization confirmation
    const confirmed = confirm(`Are you sure you want to force an account status reset for ${name}? This turns 'hasChangedPassword' back to FALSE and requires them to change it upon next login.`);
    if (!confirmed) return;

    // 2. Activate UI feedback layer
    showLoader();

    // 3. Dispatch data update fetch request payload to your server instance mapping
    const res = await fetch(`${baseApi}api/update/me/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        hasChangedPassword: false 
      }),
    });

    const data = await res.json();

    // 4. Handle failed transmission responses safely
    if (!res.ok) {
      throw new Error(data.message || `Failed to reset credential parameters for ${name}.`);
    }

    // 5. Notify success and reload the admin registry live table matrix map data
    alert(`🔒 Security lock restored for ${name}! Account status set back to temporary password restriction.`);
    
    if (typeof loadAdmins === "function") {
      loadAdmins();
    }

  } catch (err) {
    console.error("Critical error transforming account state metadata:", err);
    alert(err.message || "A network communication tracking array fault has occurred processing your request.");
  } finally {
    // 6. Clean up loading presentation canvas layers
    hideLoader();
  }
}

// Initial entry trigger execution
loadAdmins();