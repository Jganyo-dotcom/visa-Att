const baseApi = "https://attandance-app-1.onrender.com/";
const DEFAULT_AVATAR = "http://googleusercontent.com/image_collection/image_retrieval/2446120568034360762_0";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  alert("Session expired or unauthorized! Returning to Login.");
  window.location.href = "auth.html";
}

// Frame DOM node targets
const passwordModal = document.getElementById("passwordModal");
const openModalBtn = document.getElementById("openPasswordModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const changePasswordForm = document.getElementById("changePasswordForm");

// Avatar selection targets
const avatarWrapper = document.getElementById("avatarWrapper");
const avatarFileInput = document.getElementById("avatarFileInput");
const avatarPreview = document.getElementById("avatarPreview");

// Tracks current chosen base64 image data payload block 
let selectedAvatarBase64 = null;

/**
 * Hydrates UI field components using stored session cache definitions
 * @param {Object} userData Stored context token maps parsed out of storage
 */
function populateUserProfile(userData) {
  if (!userData) return;
  document.getElementById("adminName").value = userData.name || "";
  document.getElementById("adminUsername").value = userData.username || "";
  document.getElementById("adminEmail").value = userData.email || "";
  document.getElementById("adminOrg").value = userData.org || "N/A";
  document.getElementById("adminRole").value = userData.role || "Admin";
  
  // Custom fallback picture pipeline execution
  if (userData.avatarUrl && userData.avatarUrl.trim() !== "") {
    avatarPreview.src = userData.avatarUrl;
  } else {
    avatarPreview.src = DEFAULT_AVATAR;
  }
}

// Initialize interface profile maps
populateUserProfile(user);

/* ==========================================================================
   A. AVATAR UPLOAD HANDLING (Local Selection Canvas Pipeline)
   ========================================================================== */
avatarWrapper.addEventListener("click", () => {
  avatarFileInput.click();
});

avatarFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Maximum file restriction checking size matrix constraints (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    alert("Upload Limit Exceeded: Please choose a file image under 2MB size.");
    avatarFileInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    // Sync viewport graphics container node
    avatarPreview.src = event.target.result;
    // Store image base64 cache references
    selectedAvatarBase64 = event.target.result;
  };
  reader.readAsDataURL(file);
});

/* ==========================================================================
   B. PROFILE INFO UPDATE ACTIONS
   ========================================================================== */
document.getElementById("updateAdminForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const session = localStorage.getItem("sessionId");
  if (session) {
    alert("Please close active attendance sessions before modifying configuration metadata.");
    return;
  }

  const submitBtn = e.target.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  
  submitBtn.textContent = "Saving Profile...";
  submitBtn.disabled = true;

  // Assembly structure logic maps mapping out backend variables 
  const updatedUser = {
    name: document.getElementById("adminName").value.trim(),
    username: document.getElementById("adminUsername").value.trim(),
    email: document.getElementById("adminEmail").value.trim(),
  };

  // If a profile image has been modified, provide the payload link key structure
  if (selectedAvatarBase64) {
    updatedUser.avatarUrl = selectedAvatarBase64;
  }

  try {
    const res = await fetch(`${baseApi}api/update/me/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to modify dashboard data.");
    }

    alert("Profile configurations modified completely! Please sign in again.");
    
    if (typeof handleSignOut === "function") {
      handleSignOut();
    } else {
      localStorage.clear();
      window.location.href = "auth.html";
    }

  } catch (err) {
    console.error("Profile modification layout structural failure:", err);
    alert(err.message || "A tracking network error processing requests has occurred.");
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

/* ==========================================================================
   C. SLIDING ACCOUNT PASSWORD UPDATES
   ========================================================================== */
openModalBtn.addEventListener("click", () => {
  passwordModal.style.display = "flex";
  document.body.style.overflow = "hidden";
});

const closeDrawerModal = () => {
  passwordModal.style.display = "none";
  document.body.style.overflow = "";
  changePasswordForm.reset();
};

closeModalBtn.addEventListener("click", closeDrawerModal);

window.addEventListener("click", (e) => {
  if (e.target === passwordModal) {
    closeDrawerModal();
  }
});

changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    alert("Validation Mismatch: New password choices do not match.");
    return;
  }

  if (newPassword.length < 6) {
    alert("Security Notice: Password definitions must be at least 6 characters long.");
    return;
  }

  const submitBtn = changePasswordForm.querySelector("button[type='submit']");
  submitBtn.textContent = "Updating Credentials...";
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${baseApi}api/admin/change-password/${user.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to process authorization credential overhaul updates.");
    }

    alert("Credentials successfully synchronized! Re-authenticating system session.");
    closeDrawerModal();

    localStorage.clear();
    window.location.href = "auth.html";

  } catch (err) {
    console.error("Credential network validation error details:", err);
    alert(err.message || "System error modifications handling server validation arrays.");
  } finally {
    submitBtn.textContent = "Update Password";
    submitBtn.disabled = false;
  }
});