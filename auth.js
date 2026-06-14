const baseApi = "https://attandance-app-1.onrender.com/";

//const baseApi = "http://127.0.0.1:4444/";

document.addEventListener("DOMContentLoaded", () => {
  // Show loader
  function showLoader() {
    document.getElementById("loaderOverlay").style.display = "flex";
  }

  function hideLoader() {
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
        showMessage(
          "loginMessage",
          data.message || data.error || "Login failed!",
          "error",
        );
        return;
      }

      localStorage.setItem("token", data.token);
      showMessage(
        "loginMessage",
        data.message || "Login successful",
        "success",
      );
      if (data.message) {
        localStorage.setItem("user", JSON.stringify(data.safe_user));

        setTimeout(() => {
          window.location.href = "/landingPage.html"; // Change to your landing page filename/path
        }, 800);
      } else {
        showMessage(
          "loginMessage",
          data.message || data.error || "Login failed!",
          "error",
        );
      }
    } catch (err) {
      console.log(err);
      hideLoader(); // ✅ hide loader on error
      showMessage("loginMessage", "Login failed!", "error");
    }
  });

  const forgotLink = document.getElementById("forgotPassword");
  const forgotModal = document.getElementById("forgotPasswordModal");
  const closeForgot = document.getElementById("closeForgot");
  const forgotForm = document.getElementById("forgotForm");

  // Show modal when link clicked
  forgotLink.addEventListener("click", (e) => {
    window.location.href = "/reset-password.html"; // show modalC:\Users\esthe\prot\visa-Att\reset-password.html
  });

  // Handle form submit
  // forgotForm.addEventListener("submit", async (e) => {
  //   e.preventDefault();
  //   const value = document.getElementById("forgotInput").value;
  //   console.log("Forgot password request for:", value);

  //   try {
  //     const response = await fetch(baseApi + "api/forget-password", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ identifier: value }),
  //     });

  //     const result = await response.json();
  //     console.log("Backend response:", result);

  //     // Show user feedback
  //     alert(
  //       result.message || "If this account exists, a reset link will be sent.",
  //     );
  //   } catch (error) {
  //     console.error("Error sending forgot password request:", error);
  //     alert("Something went wrong. Please try again later.");
  //   }

  //   // Close modal
  //   forgotModal.style.display = "none";
  // });

  // Close modal when X is clicked
  closeForgot.addEventListener("click", () => {
    forgotModal.style.display = "none";
  });

  function showMessage(elementId, message, type = "error") {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `form-message ${type}`;
    el.style.display = "block";
  }
});

function togglePassword() {
  const input = document.getElementById("loginPassword");
  const icon = document.querySelector(".toggle-password");

  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    // Standard Diagonal Slashed Eye SVG (Hide State)
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    `;
  } else {
    input.type = "password";
    // Standard Open Eye SVG (Show State)
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    `;
  }
}
