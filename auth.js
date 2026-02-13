const baseApi = "https://attandance-app-1.onrender.com/";

//const baseApi = "http://127.0.0.1:4444/";

// Show loader
export function showLoader() {
  document.getElementById("loaderOverlay").style.display = "flex";
}

export function hideLoader() {
  document.getElementById("loaderOverlay").style.display = "none";
}

// Toggle between forms
function showRegister() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

document.getElementById("loginLink").addEventListener("click", (e) => {
  e.preventDefault();
  showLogin();
});

document.getElementById("registerLink").addEventListener("click", (e) => {
  e.preventDefault();
  showRegister();
});

// Register form submission
// Register form submission
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("regUsername").value;
    const name = document.getElementById("regName").value;
    const password = document.getElementById("regPassword").value;
    const confirm_password =
      document.getElementById("regConfirmPassword").value;
    const email = document.getElementById("regEmail").value.toLowerCase();
    const org = document.getElementById("regOrg").value;

    if (password !== confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      showLoader();

      const res = await fetch(baseApi + "api/guest/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          org,
          name,
          confirm_password,
        }),
      });

      const data = await res.json();
      hideLoader();

      if (!res.ok) {
        alert(data.error || data.message || "Registration failed!");
        console.error("Backend error:", data);
        return;
      }

      alert(data.message || "Registered successfully!");
      showLogin();
    } catch (err) {
      hideLoader();
      console.error("Network error:", err);
      alert("Network error!");
    }
  });

// Login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const main = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    showLoader(); // ✅ show loader before request

    const res = await fetch(baseApi + "api/guest/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ main, password }), // FIXED
    });

    const data = await res.json();
    hideLoader(); // ✅ hide loader after response

    if (!res.ok) {
      alert(data.message || data.error || "Login failed!");
      return;
    }

    localStorage.setItem("token", data.token);
    alert(data.message || "Login successful");

    if (data.message) {
      localStorage.setItem("user", JSON.stringify(data.safe_user));

      if (data.safe_user.role === "Admin") {
        window.location.href = "/admin.html";
      } else if (data.safe_user.role === "Staff") {
        window.location.href = "/staff.html";
      } else if (data.safe_user.role === "Manager") {
        window.location.href = "/manager.html";
      } else {
        alert("Unknown role!");
      }
    } else {
      alert(data.message || "Login failed!");
    }
  } catch (err) {
    console.log(err);
    hideLoader(); // ✅ hide loader on error
    alert("Network error during login");
  }
});

const forgotLink = document.getElementById("forgotPassword");
const forgotModal = document.getElementById("forgotPasswordModal");
const closeForgot = document.getElementById("closeForgot");
const forgotForm = document.getElementById("forgotForm");

// Show modal when link clicked
forgotLink.addEventListener("click", (e) => {
  e.preventDefault();
  forgotModal.style.display = "block";
});

// Handle form submit
forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = document.getElementById("forgotInput").value;
  console.log("Forgot password request for:", value);

  try {
    const response = await fetch(baseApi + "api/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: value }),
    });

    const result = await response.json();
    console.log("Backend response:", result);

    // Show user feedback
    alert(
      result.message || "If this account exists, a reset link will be sent.",
    );
  } catch (error) {
    console.error("Error sending forgot password request:", error);
    alert("Something went wrong. Please try again later.");
  }

  // Close modal
  forgotModal.style.display = "none";
});

// Close modal when X is clicked
closeForgot.addEventListener("click", () => {
  forgotModal.style.display = "none";
});
