//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";
const token = localStorage.getItem("token");

// Attendance list
document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;
  let currentSearch = ""; // keep track of search term

  async function loadAttendance(page = 1, searchTerm = "") {
    try {
      const limit = 20;
      const res = await fetch(
        baseApi +
          `api/get-all?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        },
      );
      const data = await res.json();

      // Show backend message if present
      if (data.message) {
        document.getElementById("attendanceMessage").textContent = data.message;
      }

      const list = document.getElementById("attendanceList");
      list.innerHTML = "";

      const staff = data.staff || data;

      staff.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s.name + " ";

        // present/undo button
        const actionBtn = document.createElement("button");
        if (s.status === "P") {
          actionBtn.textContent = "Marked";
          actionBtn.className = "undo";
          actionBtn.addEventListener("click", () =>
            undoPresent(s._id, actionBtn),
          );
        } else {
          actionBtn.textContent = "Present";
          actionBtn.className = "present";
          actionBtn.addEventListener("click", () =>
            markPresent(s._id, actionBtn),
          );
        }

        li.appendChild(actionBtn);

        list.appendChild(li);
      });

      if (data.totalPages) {
        renderAttendancePagination(data.page, data.totalPages);
      }

      currentPage = data.page;
    } catch (err) {
      console.error("Error loading attendance:", err);
    }
  }

  function renderAttendancePagination(page, totalPages) {
    const container = document.getElementById("attendancePagination");
    container.innerHTML = "";

    for (let p = 1; p <= totalPages; p++) {
      const btn = document.createElement("button");
      btn.textContent = p;
      btn.className = p === page ? "active-page" : "";
      btn.onclick = () => {
        currentPage = p;
        loadAttendance(p, currentSearch);
      };
      container.appendChild(btn);
    }
  }

  // Real-time search: query backend instead of filtering DOM
  if (document.getElementById("searchInput")) {
    document.getElementById("searchInput").addEventListener("input", (e) => {
      currentSearch = e.target.value.trim();
      loadAttendance(1, currentSearch); // reset to page 1 when searching
    });
  }

  // Initial load
  document.addEventListener("DOMContentLoaded", () => loadAttendance());

  // Mark present
  // Mark present
  // Mark present
  // Mark present
  async function markPresent(id, btn) {
    const session = localStorage.getItem("sessionId");
    try {
      const res = await fetch(baseApi + `api/mark-present/${id}/${session}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      // Create overlay
      const overlay = document.createElement("div");
      overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease;
    `;

      // Circle + icon
      const circle = document.createElement("div");
      circle.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
      animation: scaleUp 0.5s ease;
    `;

      const msg = document.createElement("div");
      msg.style.cssText = `
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      text-align: center;
    `;

      if (res.ok && data.presentPerson && data.presentPerson.status === "P") {
        circle.innerHTML = "&#10004;"; // ✔
        circle.style.backgroundColor = "green";
        msg.textContent = data.message || "Marked present";
        loadAttendance();
      } else {
        circle.innerHTML = "&#10006;"; // ✖
        circle.style.backgroundColor = "red";
        msg.textContent = data.message || "Failed to mark attendance";
      }

      overlay.appendChild(circle);
      overlay.appendChild(msg);
      document.body.appendChild(overlay);

      // Auto-remove overlay after 2 seconds
      setTimeout(() => {
        overlay.remove();
      }, 2000);
    } catch (err) {
      console.error("Network error marking present:", err);

      const overlay = document.createElement("div");
      overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease;
    `;

      const circle = document.createElement("div");
      circle.innerHTML = "&#10006;";
      circle.style.cssText = `
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: red;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      font-weight: bold;
      color: white;
      animation: scaleUp 0.5s ease;
    `;

      const msg = document.createElement("div");
      msg.textContent = "Network error marking attendance";
      msg.style.cssText = `
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: white;
      text-align: center;
    `;

      overlay.appendChild(circle);
      overlay.appendChild(msg);
      document.body.appendChild(overlay);

      setTimeout(() => {
        overlay.remove();
      }, 2000);
    }
  }

  // Add animations with CSS
  const style = document.createElement("style");
  style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { transform: scale(0.5); }
  to { transform: scale(1); }
}
`;
  document.head.appendChild(style);

  async function Refresh() {
    console.log("hit");
    loadAttendance();
  }
  loadAttendance();

  // Undo present
  async function undoPresent(id, btn) {
    const session = localStorage.getItem("sessionId");
    try {
      const res = await fetch(baseApi + `api/mark-absent/${id}/${session}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Marked absent");

        // Reset button state
        btn.textContent = "Present";
        btn.className = "present";

        // Clear old listeners
        btn.replaceWith(btn.cloneNode(true));
        const newBtn =
          document.querySelector("#attendanceList button.present:last-child") ||
          btn;

        // Attach markPresent handler
        newBtn.addEventListener("click", () => markPresent(id, newBtn));

        // Remove from localStorage
        let marked = JSON.parse(localStorage.getItem("markedList") || "[]");
        marked = marked.filter((x) => x !== id);
        localStorage.setItem("markedList", JSON.stringify(marked));
      } else {
        alert(data.message || "Failed to undo attendance");
      }
    } catch (err) {
      console.error("Network error undoing attendance:", err);
      alert("Failed to undo attendance");
    }
  }

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

  document.getElementById("staffPage").addEventListener("click", () => {
    console.log("ha");
    window.location.href = "/staffManagement.html";
  });

  document.getElementById("peoplePage").addEventListener("click", () => {
    window.location.href = "/people.html";
  });
  document.getElementById("mainPage").addEventListener("click", () => {
    window.location.href = "/admin.html";
  });

  document.getElementById("database").addEventListener("click", () => {
    window.location.href = "/database.html";
  });
  document.getElementById("profilePage").addEventListener("click", () => {
    window.location.href = "/profile.html";
  });
  document.getElementById("analysisPage").addEventListener("click", () => {
    window.location.href = "/analysis.html";
  });
  document.getElementById("code").addEventListener("click", () => {
    window.location.href = "/qrcode.html";
  });
  document.getElementById("tend").addEventListener("click", () => {
    window.location.href = "/Attend.html";
  });
});
