//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";

const token = localStorage.getItem("token");

// Global variable to store attendance data
let attendanceData = [];

document.getElementById("loadBtn").addEventListener("click", async () => {
  const date = document.getElementById("dateInput").value;
  if (!date) {
    alert("Please select a date first.");
    return;
  }

  // 1. Show the Loader immediately
  const container = document.getElementById("attendance-wrapper");
  container.innerHTML = `
    <div class="loader-container">
      <span class="loader"></span>
      <div class="loader-text">FETCHING ATTENDANCE...</div>
    </div>
  `;

  try {
    const res = await fetch(
      baseApi + `api/export-Attendance-Html?date=${date}`,
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
      // Replace loader with error message
      container.innerHTML = `<p style="color:red; text-align:center;">${data.message}</p>`;
      return;
    }

    // Save data globally
    attendanceData = data.attendance;

    // 2. Render table (This replaces the loader automatically)
    renderTable(attendanceData, date, data.footer);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    container.innerHTML = `<p style="color:red; text-align:center;">Failed to connect to server.</p>`;
  }
});

// Function to render table
function renderTable(rows, date, footer) {
  let html = `
    <h2>Attendance Report for ${date}</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Status</th>
          <th>Date</th>
          <th>Arrived At</th>
          <th>Marked By</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach((row) => {
    html += `
      <tr>
        <td data-label="Name">${row.name?.name || ""}</td>
        <td data-label="Department">${row.name?.department || ""}</td>
        <td data-label="Status">${row.status || ""}</td>
        <td data-label="Date">${new Date(row.date).toLocaleDateString() || ""}</td>
        <td data-label="Arrived At">${new Date(row.updatedAt).toLocaleString() || ""}</td>
        <td data-label="Marked By">${row.markedBy || ""}</td>
      </tr>
    `;
  });

  html += `</tbody></table>
    <div class="footer-message">${footer}</div>`;

  document.getElementById("attendance-wrapper").innerHTML = html;
}

// Real-time search filter
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = attendanceData.filter(
    (row) =>
      (row.name?.name || "").toLowerCase().includes(query) ||
      (row.name?.department || "").toLowerCase().includes(query) ||
      (row.status || "").toLowerCase().includes(query) ||
      (row.markedBy || "").toLowerCase().includes(query),
  );

  renderTable(
    filtered,
    document.getElementById("dateInput").value,
    "Thank you for choosing ELITech. Contact: 0593320375",
  );
});

// Fetch flagged absentees
async function loadAbsentees() {
  const res = await fetch(baseApi + "api/frequent-absentees", {
    headers: { Authorization: "Bearer " + token },
  });
  const data = await res.json();
  alert(data.message);
  return data.absentees;
}

// Render table with flagged absentees
function renderTable(rows, date, footer, absentees = []) {
  const flaggedIds = absentees.map((a) => a.personName.toLowerCase());

  let html = `
    <h2>Attendance Report for ${date}</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Status</th>
          <th>Date</th>
          <th>Arrived Att</th>
          <th>Marked By</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach((row) => {
    const isFlagged = flaggedIds.includes((row.name?.name || "").toLowerCase());
    html += `
      <tr class="${isFlagged ? "flagged" : ""}">
        <td>${row.name?.name || ""}</td>
        <td>${row.name?.department || ""}</td>
        <td>${row.status || ""}</td>
        <td>${new Date(row.date).toLocaleDateString() || ""}</td>
        <td>${new Date(row.updatedAt).toLocaleString() || ""}</td>
        <td>${row.markedBy || ""}</td>
      </tr>
    `;
  });

  html += `</tbody></table>
    <div class="footer-message">${footer}</div>`;

  document.getElementById("attendance-wrapper").innerHTML = html;
}

loadAbsentees();
