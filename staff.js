// Load staff attendance list
// const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

document.getElementById("staffsignOutBtn").addEventListener("click", () => {
  // Remove only the token
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem(user);

  alert("You have been signed out.");
  window.location.href = "index.html"; // redirect to login page
});

function showLoader() {
  document.getElementById("staffloaderOverlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("staffloaderOverlay").style.display = "none";
}

async function Refresh() {
  loadAttendance();
}
const refreshBtn = document.getElementById("refreshit");
refreshBtn.addEventListener("click", Refresh);

document.getElementById("welcome").innerHTML = `Welcome ${user.username}`;
console.log("loaded");
let currentPage = 1;
let currentSearch = ""; // keep track of search term

async function loadAttendance(page = 1, searchTerm = "") {
  try {
    const res = await fetch(
      baseApi +
        `api/get-all?page=${page}&search=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      },
    );
    const data = await res.json();

    if (data.message) {
      document.getElementById("attendanceMessage").textContent = data.message;
    }

    const list = document.getElementById("attendanceList");
    hideLoader();
    list.innerHTML = "";

    const staff = data.staff || data;

    staff.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s.name + " ";

      const btn = document.createElement("button");

      if (s.status === "P") {
        btn.textContent = "Marked";
        btn.className = "undo";
        btn.addEventListener("click", () => undoPresent(s._id, btn));
      } else {
        btn.textContent = "Present";
        btn.className = "present";
        btn.addEventListener("click", () => markPresent(s._id, btn));
      }

      li.appendChild(btn);
      list.appendChild(li);
    });

    if (data.totalPages) {
      renderAttendancePagination(data.page, data.totalPages);
    }

    currentPage = data.page;
  } catch (err) {
    hideLoader();
    console.error("Error loading attendance:", err);
    alert("Failed to load attendance");
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
document.getElementById("searchInput").addEventListener("input", (e) => {
  currentSearch = e.target.value.trim();
  loadAttendance(1, currentSearch); // reset to page 1 when searching
});

// Initial load
document.addEventListener("DOMContentLoaded", () => loadAttendance());

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
    console.log("Mark present response:", data);

    if (res.ok) {
      alert(data.message || "Marked present");

      if (data.presentPerson && data.presentPerson.status === "P") {
        btn.textContent = "Marked";
        btn.className = "undo";

        // Remove any existing listeners
        btn.replaceWith(btn.cloneNode(true));
        const newBtn =
          document.querySelector("#attendanceList button.undo:last-child") ||
          btn;

        // Attach undo handler

        newBtn.addEventListener("click", () => undoPresent(id, newBtn));
        loadAttendance();
        // Save marked state
        let marked = JSON.parse(localStorage.getItem("markedList") || "[]");
        if (!marked.includes(id)) {
          marked.push(id);
          localStorage.setItem("markedList", JSON.stringify(marked));
        }
      }
    } else {
      alert(data.message || "Failed to mark attendance");
    }
  } catch (err) {
    console.error("Network error marking present:", err);
    alert("Failed to mark attendance");
  }
}

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
    console.log("Undo present response:", data);

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

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const form = document.getElementById("createPersonForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized!");
      window.location.href = "auth.html";
      return;
    }
    const person = {
      name: capitalise(document.getElementById("name").value),
      department: capitalise(document.getElementById("department").value),
      contact: document.getElementById("contact").value,
    };
    try {
      showLoader();
      const res = await fetch(baseApi + "api/create-person", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(person),
      });
      const data = await res.json();
      hideLoader();
      if (!res.ok) {
        alert(data.message || data.error || "Failed to create person");
        console.error("Error:", data);
        return;
      }
      alert(data.message || "Person created successfully!");
      loadAttendance();
      form.reset();
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error!");
    }
  });
}

// Mark all present
async function markAllPresent() {
  await fetch("/api/attendance/markAll", { method: "POST" });
  loadAttendance();
}

// Initial load
loadAttendance();
