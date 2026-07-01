
const baseApi = "https://attandance-app-1.onrender.com/";
 //const baseApi = "http://127.0.0.1:4444/";


document.addEventListener("DOMContentLoaded", () => {
  // Global temporary placeholder to track user identity across screen states
  let pendingVerifyEmail = "";

  function showLoader() {
    document.getElementById("loaderOverlay").style.display = "flex";
  }

  function hideLoader() {
    document.getElementById("loaderOverlay").style.display = "none";
  }

  // View state controller switches
  function resetForms() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("verifyForm").classList.add("hidden");
  }

  function showLogin() {
    resetForms();
    document.getElementById("loginForm").classList.remove("hidden");
  }
  function showVerify() {
    resetForms();
    document.getElementById("verifyForm").classList.remove("hidden");
  }

  // Basic event binding configurations
  document.getElementById("backToLoginLink").addEventListener("click", (e) => { 
    e.preventDefault(); 
    showLogin(); 
  });

  // Login transaction submission sequence
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const main = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      showLoader();
      const res = await fetch(baseApi + "api/guest/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ main, password }),
      });

      const data = await res.json();
      hideLoader();

      // Check if user account needs to trigger OTP verification loop
      if ( data.otp ===true) {
        pendingVerifyEmail = main; // cache email or username context
        showMessage("verifyMessage", "Account unverified. An active security OTP was routed to your email.", "error");
        showVerify();
        return;
      }

      if (!res.ok) {
        showMessage("loginMessage", data.message || data.error || "Login failed!", "error");
        return;
      }

      // Successful connection routing state matrix
      executeSessionOnboarding(data);
    } catch (err) {
      console.error(err);
      hideLoader();
      showMessage("loginMessage", "Login failed!", "error");
    }
  });

  // Verification form tracking handler
  document.getElementById("verifyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("verifyOtp").value.trim();

    try {
      showLoader();
      const res = await fetch(baseApi + "api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingVerifyEmail, otp: otp }),
      });

      const data = await res.json();
      hideLoader();

      if (!res.ok) {
        showMessage("verifyMessage", data.message || data.error || "Verification code invalid.", "error");
        return;
      }

      showMessage("verifyMessage", "Account authenticated completely! Redirecting...", "success");
      
      // On success token synchronization layer activation
      executeSessionOnboarding(data);
    } catch (err) {
      console.error(err);
      hideLoader();
      showMessage("verifyMessage", "Verification execution failure.", "error");
    }
  });

  function executeSessionOnboarding(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.safe_user || data.user));
    setTimeout(() => {
      window.location.href = "/landingPage.html";
    }, 800);
  }

  async function verifySession() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) return;

    try {
      const res = await fetch(baseApi + "api/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }
      executeSessionOnboarding(data);
    } catch (err) {
      console.error("Verification error:", err);
    }
  }

  verifySession();

  document.getElementById("forgotPassword").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/reset-password";
  });

  function showMessage(elementId, message, type = "error") {
    const el = document.getElementById(elementId);
    if (!el) return;
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
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>`;
  } else {
    input.type = "password";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 20px; height: 20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
  }
}
