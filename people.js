// Fetch pending accounts
//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";
console.log("loaded");
let instructionSign = true;
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");

const openBtnDesktop = document.getElementById("changePasswordBtn");

const closeBtn = document.getElementById("closeModal");

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

// Close menu when clicking outside
window.addEventListener("click", (e) => {
  if (!sideMenu.contains(e.target) && e.target !== hamburgerBtn) {
    sideMenu.classList.remove("active");
    hamburgerBtn.innerHTML = "&#9776;";
  }
});

// // --- Modal Logic ---
// if (user.hasChangedPassword !== true) {
//   console.log("User must change password:", user);
//   modal.style.display = "flex"; // force modal open
//   if (closeBtn) closeBtn.style.display = "none"; // hide close button
// } else {
//   modal.style.display = "none";
// }

// Open modal from desktop button
// if (openBtnDesktop) {
//   openBtnDesktop.addEventListener("click", () => {
//     modal.style.display = "flex";
//   });
// }

// // Close modal
// if (closeBtn) {
//   closeBtn.addEventListener("click", () => {
//     modal.style.display = "none";
//   });
// }

// Close modal when clicking outside, but only if user has already changed password
// window.addEventListener("click", (e) => {
//   if (user.hasChangedPassword === true && e.target === modal) {
//     modal.style.display = "none";
//   }
// });

// const formm = document.getElementById("changePasswordForm");

// Close when clicking outside modal

const deleteAccountBtn = document.getElementById("deleteAccount");

deleteAccountBtn.addEventListener("click", async () => {
  const confirmed = confirm(
    "Are you sure you want to delete your account? This action cannot be undone.",
  );
  if (!confirmed) return;

  try {
    // Call backend route
    const res = await fetch(baseApi + `api/admin/${user.id}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}`,
      },
    });

    if (res.ok) {
      // Clear tokens
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // if you stored user info

      // Redirect to auth/login page
      window.location.href = "/auth.html";
    } else {
      const data = await res.json();
      alert("Error deleting account: " + data.message);
    }
  } catch (err) {
    console.error("Delete account error:", err);
    alert("Server error deleting account");
  }
});

const signOut = document.getElementById("signOutBtn");
signOut.addEventListener("click", handleSignOut);

function handleSignOut() {
  if (instructionSign !== true) {
    alert("close session before you can signout");
    return;
  }
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // only if you stored user info under this key
  window.location.href = "/auth.html"; // redirect to login or home
}

const changePasswordBtn = document.getElementById("changePasswordBtn");
const modal = document.getElementById("changePasswordModal");
const closeModal = document.getElementById("closeModal");

if (changePasswordBtn && modal) {
  changePasswordBtn.addEventListener("click", () => {
    modal.style.display = "flex"; // show modal
  });
}

if (closeModal && modal) {
  closeModal.addEventListener("click", () => {
    modal.style.display = "none"; // hide modal
  });
}

// Optional: close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

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

document
  .getElementById("searchInputonAbsent")
  .addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll("#absentList li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(term)
        ? ""
        : "none";
    });
  });
let limit = 10;
async function loadAbsentPeople(page = 1, searchTerm = "") {
  console.log("hi");
  try {
    const response = await fetch(
      baseApi +
        `api/Absents?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      },
    );

    const result = await response.json();

    const list = document.getElementById("absentList");
    list.innerHTML = "";

    result.data.forEach((person) => {
      const li = document.createElement("li");
      li.textContent = `${person.name} (${person.department}) ${person.contact}`;
      list.appendChild(li);
    });

    // Update pagination info
    document.getElementById("pageInfo").textContent =
      `Page ${result.page} of ${result.totalPages}`;

    // Enable/disable buttons
    document.getElementById("prevBtn").disabled = result.page <= 1;
    document.getElementById("nextBtn").disabled =
      result.page >= result.totalPages;

    currentPagee = result.page;
  } catch (err) {
    console.error("Error fetching absent people:", err);
  }
}

// Event listeners for pagination buttons
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPagee > 1) {
    loadAbsentPeople(
      currentPagee - 1,
      document.getElementById("searchInputonAbsent").value,
    );
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  loadAbsentPeople(
    currentPagee + 1,
    document.getElementById("searchInputonAbsent").value,
  );
});

loadAbsentPeople();

// formm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const currentPassword = document.getElementById("currentPassword").value;
//   const newPassword = document.getElementById("newPassword").value;

//   try {
//     const token = localStorage.getItem("token"); // assuming you store JWT in localStorage
//     showLoader();
//     const response = await fetch(
//       baseApi + `api/admin/change-password/${user.id}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ currentPassword, newPassword }),
//       },
//     );

//     const data = await response.json();
//     hideLoader();
//     if (response.ok) {
//       alert("Password updated successfully!");
//       modal.style.display = "none";
//       handleSignOut();
//     } else {
//       hideLoader();
//       alert(data.message || "Error updating password");
//     }
//   } catch (err) {
//     hideLoader();
//     console.error(err);
//     alert("Something went wrong");
//   }
// });
