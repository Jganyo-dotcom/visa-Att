const baseApi = "https://attandance-app-1.onrender.com/";
//const baseApi = "http://127.0.0.1:4444/";
// Update this constant at the very top of profile.js
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
const token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user")); // Changed to 'let' so we can modify the cache dynamically

// --- CLOUDINARY CONFIGURATION FOR FRONTEND UPLOADS ---
const CLOUDINARY_CLOUD_NAME = "dvjaeogmn"; // 👈 Put your real cloud name here
const CLOUDINARY_PRESET = "cmlbmag6"; // Your working unsigned preset code

if (!token || !user) {
  alert("Session expired or unauthorized! Returning to Login.");
  window.location.href = "auth.html";
}

if (user.avatarUrl && user.avatarUrl !== "") {
  document.querySelector(".logo").src = user.avatarUrl;
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

// Tracks current chosen file data payload block
let selectedFileObject = null;

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
if (avatarWrapper) {
  avatarWrapper.addEventListener("click", () => {
    avatarFileInput.click();
  });
}

if (avatarFileInput) {
  avatarFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Maximum file restriction checking size matrix constraints (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert(
        "Upload Limit Exceeded: Please choose a file image under 2MB size.",
      );
      avatarFileInput.value = "";
      return;
    }

    // Cache the clean binary file object globally to upload later on submit
    selectedFileObject = file;

    // Fast URL object creation for immediate visual UI response
    avatarPreview.src = URL.createObjectURL(file);
  });
}

/* ==========================================================================
   B. PROFILE INFO UPDATE ACTIONS (IN-PLACE REFLECTIONS)
   ========================================================================== */
const updateAdminForm = document.getElementById("updateAdminForm");
if (updateAdminForm) {
  updateAdminForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const session = localStorage.getItem("sessionId");
    if (session) {
      alert(
        "Please close active attendance sessions before modifying configuration metadata.",
      );
      return;
    }

    const submitBtn = e.target.querySelector("button[type='submit']");
    const originalText = submitBtn ? submitBtn.textContent : "Save Changes";

    if (submitBtn) {
      submitBtn.textContent = "Saving Profile...";
      submitBtn.disabled = true;
    }

    // Assembly structure logic maps mapping out backend variables
    const updatedFields = {
      name: document.getElementById("adminName").value.trim(),
      username: document.getElementById("adminUsername").value.trim(),
      email: document.getElementById("adminEmail").value.trim(),
    };

    // ONLY attach avatarUrl if the user currently has one stored in session memory
    if (user.avatarUrl) {
      updatedFields.avatarUrl = user.avatarUrl;
    }

    try {
      // 1. IF A NEW FILE WAS CHOSEN, PUSH TO CLOUDINARY FIRST
      if (selectedFileObject) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        // Check file type
        if (!allowedTypes.includes(selectedFileObject.type)) {
          alert("Only JPG, PNG, or WebP images are allowed.");
          return;
        }

        // Check file size (2MB max)
        if (selectedFileObject.size > 2 * 1024 * 1024) {
          alert("Upload Limit Exceeded: Please choose an image under 2MB.");
          return;
        }
        if (submitBtn) submitBtn.textContent = "Uploading image...";

        const cloudinaryForm = new FormData();
        cloudinaryForm.append("file", selectedFileObject);
        cloudinaryForm.append("upload_preset", CLOUDINARY_PRESET);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: cloudinaryForm,
          },
        );

        const cloudData = await cloudRes.json();

        if (!cloudRes.ok) {
          throw new Error(
            cloudData.error?.message || "Cloudinary image upload failed.",
          );
        }

        // Overwrite field string directly with clean final Cloudinary URL
        updatedFields.avatarUrl = cloudData.secure_url;
      }

      // 2. DISPATCH CLEAN JSON TEXT PAYLOAD TO RENDER BACKEND
      if (submitBtn) submitBtn.textContent = "Saving text options...";

      const res = await fetch(`${baseApi}api/update/me/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to modify dashboard data.");
      }

      // Sync local state using the fresh document parsing values from your backend
      user = { ...user, ...data.updatedPerson };
      localStorage.setItem("user", JSON.stringify(user));

      // Refresh UI inputs with newly configured data mappings
      populateUserProfile(user);

      // Dynamically update your global custom sidebar welcome header text if it exists
      const welcomeHeader = document.getElementById("welcome");
      if (welcomeHeader) {
        welcomeHeader.textContent = `Admin Profile (${user.name})`;
      }

      // Reset runtime tracking references
      selectedFileObject = null;

      alert("🎉 Profile updated successfully without system disruption!");
    } catch (err) {
      console.error("Profile modification layout structural failure:", err);
      alert(
        err.message ||
          "A tracking network error processing requests has occurred.",
      );
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  });
}

/* ==========================================================================
   C. SLIDING ACCOUNT PASSWORD UPDATES (IN-PLACE LIVE UPDATES)
   ========================================================================== */
// if (openModalBtn) {
//   openModalBtn.addEventListener("click", () => {
//     if (passwordModal) {
//       passwordModal.style.display = "flex";
//       document.body.style.overflow = "hidden";
//     }
//   });
// }

/* ==========================================================================
   C. SLIDING ACCOUNT PASSWORD UPDATES (IN-PLACE LIVE UPDATES)
   ========================================================================== */
if (openModalBtn) {
  openModalBtn.addEventListener("click", () => {
    if (passwordModal) {
      passwordModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  });
}

// CRASH PROTECTION: Built to safely handle elements targeted/removed by the global enforcer script
const closeDrawerModal = () => {
  if (passwordModal) passwordModal.style.display = "none";
  document.body.style.overflow = "";
  if (changePasswordForm) {
    changePasswordForm.reset();
  }
};

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeDrawerModal);
}

window.addEventListener("click", (e) => {
  if (e.target === passwordModal) {
    // Only allow backdrop clicking to dismiss if the user has already changed their password
    if (user && user.hasChangedPassword !== false) {
      closeDrawerModal();
    }
  }
});

if (changePasswordForm) {
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
      alert(
        "Security Notice: Password definitions must be at least 6 characters long.",
      );
      return;
    }

    const submitBtn = changePasswordForm.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.textContent = "Updating Credentials...";
      submitBtn.disabled = true;
    }

    try {
      const response = await fetch(
        `${baseApi}api/admin/change-password/${user.id}`,
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

      if (!response.ok) {
        // Extract the most useful message from the server response
        const errorMsg =
          data.message ||
          data.error ||
          "Failed to process authorization credential overhaul updates.";

        // Show it directly to the user
        alert(`❌ ${errorMsg}`);

        // Stop execution so the success code doesn't run
        return;
      }

      // --- NO LOGOUT. SECURE USER STATUS TO COMPLETED ---
      user.hasChangedPassword = true;
      localStorage.setItem("user", JSON.stringify(user));

      alert(
        "🔒 Password changed successfully! Your account state has been secured.",
      );

      // Seamlessly hide the modal window and clean fields back out
      closeDrawerModal();

      // Instantly restore page interaction states by refreshing normal access parameters
      if (window.location.reload) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Credential network validation error details:", err);
      alert(
        err.message ||
          "System error modifications handling server validation arrays.",
      );
    } finally {
      if (submitBtn) {
        submitBtn.textContent = "Update Password";
        submitBtn.disabled = false;
      }
    }
  });
}
