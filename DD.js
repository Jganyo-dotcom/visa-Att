const baseApi = "https://attandance-app-1.onrender.com/";

//const baseApi = "http://127.0.0.1:4444/";
const token = localStorage.getItem("token");

document.getElementById("loadBtn").addEventListener("click", async () => {
  const date = document.getElementById("reportDate").value;
  if (!date) {
    alert("Please select a date");
    return;
  }

  const loader = document.getElementById("loader");
  const wrapper = document.getElementById("report-wrapper");

  // Show loader and clear old content
  loader.style.display = "block";
  wrapper.innerHTML = "";

  try {
    const res = await fetch(baseApi + `api/stayed-report/?date=${date}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const data = await res.json();


    if (res.ok) {
      renderTable(data.list || []);
    } else {
      alert(data.message || "Failed to load stayed records");
    }
  } catch (err) {
    console.error("Error loading stayed records:", err);
    alert("Network error loading stayed records");
  } finally {
    // Hide loader after fetch completes
    loader.style.display = "none";
  }
});

function renderTable(records) {
  const wrapper = document.getElementById("report-wrapper");
  wrapper.innerHTML = "";

  if (records.length === 0) {
    wrapper.innerHTML = "<p>No stayed records found for this date.</p>";
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Gender</th>
      <th>Status</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  records.forEach((r) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.name.name}</td>
      <td>${r.name.contact}</td>
      <td>${r.status}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
}

// Optional: search filter
document.getElementById("searchInput").addEventListener("input", (e) => {
  const filter = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#report-wrapper table tbody tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
});
