// const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";
console.log("loaded");
let instruction = "stop!!";

export function showLoader() {
  document.getElementById("loaderrOverlay").style.display = "flex";
}

export function hideLoader() {
  document.getElementById("loaderrOverlay").style.display = "none";
}

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));


document.getElementById("welcome").innerHTML = `Welcome ${user.username}`;
console.log("loaded");

// Fetch pending accounts
async function loadPending() {
  try {
    showLoader();
    const res = await fetch(baseApi + "api/admin/pending/accounts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const result = await res.json();
    hideLoader();
    if (!res.ok) {
      hideLoader();
      alert(result.message || "Failed to load pending accounts");
      console.error("Error:", result);
      return;
    }

    if (result.message) {
      alert(result.message);
   
    }

    const list = document.getElementById("pendingList");
    if (!list) {
      console.error("No element with id 'pendingList'");
      return;
    }
    list.innerHTML = "";

    // ✅ Use result.data because that's where the array is
    const users = result.data;

    users.forEach((u) => {
      const li = document.createElement("li");
      li.innerHTML = `${u.name} (${u.username}, ${u.email}) 
        <button class="approve" onclick="approveUser('${u._id}')">Approve</button>`;
      list.appendChild(li);
    });
  } catch (err) {
    hideLoader();
    console.error("Error loading pending:", err);
    alert("Failed to load pending accounts");
  }
}

// expose approveUser if you rely on inline onclick
window.approveUser = approveUser;

// Fetch locked accounts
async function loadLocked() {
  try {
    const res = await fetch(baseApi + "api/admin/blocked/accounts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Failed to load locked accounts");
      console.error("Error:", result);
      return;
    }

    const list = document.getElementById("lockedList");
    if (!list) {
      console.error("No element with id 'lockedList'");
      return;
    }
    list.innerHTML = "";

    // ✅ Use result.data
    result.data.forEach((u) => {
      const li = document.createElement("li");
      li.textContent = `${u.name} (${u.username}, ${u.email})`;

      const btn = document.createElement("button");
      btn.textContent = "Unblock";
      btn.className = "unblock";
      btn.addEventListener("click", () => unblockUser(u._id));

      li.appendChild(btn);
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading locked accounts:", err);
    alert("Failed to load locked accounts");
  }
}

// Attendance list
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

// Approve user
async function approveUser(id) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized!");
      window.location.href = "auth.html";
      return;
    }

    const res = await fetch(baseApi + `api/admin/verify/${id}`, {
      method: "GET", // switched to GET
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to approve user");
      console.error("Error approving user:", data);
      return;
    }

    if (data.message) {
      alert(data.message); // show backend feedback

    }

    // reload pending list
    loadPending();
  } catch (err) {
    console.error("Network error approving user:", err);
    alert("Network error!");
  }
}

// Unblock user
async function unblockUser(id) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized!");
      window.location.href = "auth.html";
      return;
    }

    const res = await fetch(baseApi + `api/admin/unblock/${id}`, {
      method: "GET", // backend expects GET
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to unblock user");
      console.error("Error unblocking user:", data);
      return;
    }

    if (data.message) {
      alert(data.message); // show backend feedback

    }

    // reload locked accounts list
    loadLocked();
  } catch (err) {
    console.error("Network error unblocking user:", err);
    alert("Network error!");
  }
}

document.getElementById("signOutBtn").addEventListener("click", () => {
  // Remove only the token
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem(user);

  alert("You have been signed out.");
  window.location.href = "index.html"; // redirect to login page
});

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

// Mark all present
async function markAllPresent() {
  await fetch("/api/attendance/markAll", { method: "POST" });
  loadAttendance();
}

document
  .getElementById("searchInputonAbsent")
  .addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll("#aabsentList li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(term)
        ? ""
        : "none";
    });
  });

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
      name: document.getElementById("name").value,
      department: document.getElementById("department").value,
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
        alert(data.message || "Failed to create person");
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

const createSessionBtn = document.getElementById("createSessionBtn");

// initialize button state based on localStorage
if (localStorage.getItem("sessionId")) {
  createSessionBtn.textContent = "Close Session";
  createSessionBtn.classList.add("danger");
} else {
  createSessionBtn.textContent = "✨ Create Session ✨";
}

createSessionBtn.addEventListener("click", async () => {
  if (createSessionBtn.textContent === "✨ Create Session ✨") {
    await CreateSession();
  } else {
    CloseSession();
  }
});

async function CreateSession() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authorized!");
      window.location.href = "auth.html";
      return;
    }

    const res = await fetch(baseApi + "api/create-session", {
      method: "GET", // backend expects GET
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to create session");
      console.error("Error creating session:", data);
      return;
    }

    if (data.message) {
      alert(data.message);

    }

    if (data.newSession?._id) {
      localStorage.setItem("sessionId", data.newSession._id);


      // ✅ toggle button text and style
      createSessionBtn.textContent = "Close Session";
      createSessionBtn.classList.add("danger");
    }
  } catch (err) {
    console.error("Network error creating session:", err);
    alert("Network error!");
  }
}

async function CloseSession() {
  try {
    if (instruction !== "go ahead") {
      alert("print attendance before you close session");
      return;
    }
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("sessionId");

    if (!token || !sessionId) {
      alert("No active session found");
      return;
    }

    const res = await fetch(baseApi + `api/close-session/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to close session");
      console.error("Error closing session:", data);
      return;
    }

    if (data.message) {
      alert(data.message);
  
    }

    // ✅ Clear localStorage and toggle button text
    localStorage.removeItem("sessionId");
    console.log("Session cleared from localStorage");

    createSessionBtn.textContent = "✨ Create Session ✨";
    createSessionBtn.classList.remove("danger");
  } catch (err) {
    console.error("Network error closing session:", err);
    alert("Network error!");
  }
}

let currentPagee = 1;
const limit = 5; // number of items per page

async function loadAbsentPeople(page = 1, searchTerm = "") {
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

document.getElementById("printBtn").addEventListener("click", async () => {
  try {
    const session = localStorage.getItem("sessionId");
    const response = await fetch(
      baseApi + `api/admin/export-attendance/${session}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    // Convert response to blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    instruction = "go ahead";

    // Use filename from backend headers
    const disposition = response.headers.get("Content-Disposition");
    let filename = "attendance.xlsx";
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1];
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading attendance:", err);
    alert("Failed to download attendance file");
  }
});

// Real-time search
document
  .getElementById("searchInputonAbsent")
  .addEventListener("input", (e) => {
    const term = e.target.value;
    loadAbsentPeople(1, term); // always start from page 1 when searching
  });

// Initial load
document.addEventListener("DOMContentLoaded", () => loadAbsentPeople());

// Load first page on page ready
document.addEventListener("DOMContentLoaded", () => loadAbsentPeople());

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  console.log("loaded");
  loadPending();
  loadLocked();
  loadAttendance();
  loadAbsentPeople();
});
