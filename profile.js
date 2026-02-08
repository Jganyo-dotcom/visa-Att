//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// Side menu toggle
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");

// const closeBtn = document.getElementById("closeModal");

// --- Side Menu Logic ---
hamburgerBtn.addEventListener("click", () => {
  sideMenu.classList.toggle("active");

  // Toggle hamburger icon ↔ X
  if (sideMenu.classList.contains("active")) {
    hamburgerBtn.innerHTML = "&times;"; // X
  } else {
    hamburgerBtn.innerHTML = "&#9776;"; // Hamburger
  }
});

// Close menu when clicking the X inside
if (closeMenuBtn) {
  closeMenuBtn.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    hamburgerBtn.innerHTML = "&#9776;";
  });
}

// updating pro

function UpdateUser(user) {
  document.getElementById("adminName").value = user.name;
  document.getElementById("adminUsername").value = user.username;
  document.getElementById("adminEmail").value = user.email;
  document.getElementById("adminOrg").value = user.org;
  document.getElementById("adminRole").value = user.role;
}

UpdateUser(user);

document
  .getElementById("updateAdminForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const session = localStorage.getItem("sessionId");
    if (session) {
      alert("print and close session before Editing profile");
      return;
    }

    const submitBtn = e.target.querySelector("button[type='submit']");
    submitBtn.textContent = "Updating...";
    submitBtn.disabled = true;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized!");
      window.location.href = "auth.html";
      return;
    }

    // Build updatedUser object
    const updatedUser = {
      name: document.getElementById("adminName").value,
      username: document.getElementById("adminUsername").value,
      email: document.getElementById("adminEmail").value,
    };

    // Only include level if org is Visa

    try {
      console.log(user);
      const res = await fetch(baseApi + `api/update/me/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update user");
        console.error("Error updating user:", data);
      } else {
        handleSignOut();
        alert(data.message || "User updated successfully!");
      }
    } catch (err) {
      console.error("Network error updating user:", err);
      alert("Network error!");
    } finally {
      submitBtn.textContent = "Save Changes";
      submitBtn.disabled = false;
    }
  });

// Update profile form

// Sign out
function handleSignOut() {
  // Ask three times for confirmation
  for (let i = 1; i <= 3; i++) {
    const confirmed = confirm(`(${i}/3) Are you sure you want to sign out?`);
    if (!confirmed) {
      alert("Sign out cancelled");
      return;
    }
  }

  // Only reaches here if user clicked OK all three times
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // only if you stored user info under this key
  window.location.href = "/auth.html"; // redirect to login or home
}

document.getElementById("staffPage").addEventListener("click", () => {
  console.log("ha");
  window.location.href = "/staffManagement.html";
});

document.getElementById("peoplePage").addEventListener("click", () => {
  window.location.href = "/people.html";
});

document.getElementById("database").addEventListener("click", () => {
  window.location.href = "/database.html";
});
document.getElementById("mainPage").addEventListener("click", () => {
  window.location.href = "/admin.html";
});
// document.getElementById("profilePage").addEventListener("click", () => {
//   window.location.href = "/profile.html";
// });
