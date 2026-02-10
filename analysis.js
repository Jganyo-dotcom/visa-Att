//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const token = localStorage.getItem("token");

// const modal = document.getElementById("changePasswordModal");
const openBtnDesktop = document.getElementById("changePasswordBtn");

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

// Close menu when clicking outside
window.addEventListener("click", (e) => {
  if (!sideMenu.contains(e.target) && e.target !== hamburgerBtn) {
    sideMenu.classList.remove("active");
    hamburgerBtn.innerHTML = "&#9776;";
  }
});

document.getElementById("database").addEventListener("click", () => {
  window.location.href = "/database.html";
});
document.getElementById("mainPage").addEventListener("click", () => {
  window.location.href = "/admin.html";
});
document.getElementById("profilePage").addEventListener("click", () => {
  window.location.href = "/profile.html";
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("loadReportBtn").addEventListener("click", async () => {
  const date = document.getElementById("reportDate").value;
  if (!date) {
    alert("Please select a date");
    return;
  }

  try {
    // Call backend endpoint with selected date
    const res = await fetch(baseApi + `api/end-of-day-report?date=${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const data = await res.json();

    if (data.message) {
      alert(data.message);
      return;
    }

    // Destroy old charts if they exist
    if (window.pieChart) window.pieChart.destroy();
    if (window.barChart) window.barChart.destroy();

    // Pie chart
    window.pieChart = new Chart(document.getElementById("dailyPie"), {
      type: "pie",
      data: {
        labels: ["Present", "Absent"],
        datasets: [
          {
            data: [data.present, data.absent],
            backgroundColor: ["#28a745", "#dc3545"], // green for P, red for A
          },
        ],
      },
    });

    // Bar chart
    window.barChart = new Chart(document.getElementById("dailyBar"), {
      type: "bar",
      data: {
        labels: ["Present", "Absent"],
        datasets: [
          {
            label: `Attendance for ${data.date}`,
            data: [data.present, data.absent],
            backgroundColor: ["#28a745", "#dc3545"],
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  } catch (err) {
    console.error(err);
    alert("Error loading report");
  }
});
