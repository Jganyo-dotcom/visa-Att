const baseApi = "https://attandance-app-1.onrender.com/";

// const baseApi = "http://127.0.0.1:4444/";

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
    const email = document.getElementById("regEmail").value;
    const org = document.getElementById("regOrg").value;

    if (password !== confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      showLoader();

      const res = await fetch(baseApi + "api/guest/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          confirm_password,
          org,
        }),
      });

      const data = await res.json(); // parse JSON no matter what
      hideLoader();

      if (!res.ok) {
        // Show backend message if available
        alert(data.error || "Registration failed!");
        console.error("Backend error:", data); // log full response for debugging
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

  const main = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

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
      alert(data.message || "Login failed!");
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
