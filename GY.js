const baseApi = "https://attandance-app-1.onrender.com/";

//const baseApi = "http://127.0.0.1:4444/";
const token = localStorage.getItem("token");

if (!token) {
  alert("Not authorized!");
  window.location.href = "auth.html";
  return;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadBtn").addEventListener("click", async () => {
    const dayOne = document.getElementById("dayOne").value;
    const dayTwo = document.getElementById("dayTwo").value;
    const statusOne = document.getElementById("statusOne").value;
    const statusTwo = document.getElementById("statusTwo").value;

    if (!dayOne || !dayTwo || !statusOne || !statusTwo) {
      alert("Please fill in all fields.");
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
      const response = await fetch(
        baseApi +
          `api/freq-absentees-present/${statusOne}/${statusTwo}?dayOnedate=${dayOne}&dayTwodate=${dayTwo}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      );

      const data = await response.json();
      // If the server returned an error status, handle it
      if (!response.ok) {
        container.innerHTML = `<p style="color:red; text-align:center;">${data.message || "Error fetching data"}</p>`;
        return;
      }

      const wrapper = document.getElementById("attendance-wrapper");
      wrapper.innerHTML = ""; // clear previous results

      const heading = document.createElement("h2");
      heading.textContent = data.message;
      wrapper.appendChild(heading);

      if (data.absentees.length === 0) {
        wrapper.innerHTML += "<p>No absentees found.</p>";
      } else {
        const table = document.createElement("table");
        table.classList.add("attendance-table");

        const headerRow = document.createElement("tr");
        headerRow.innerHTML = "<th>Name</th><th>Status</th><th>Phone</th>";
        table.appendChild(headerRow);

        data.absentees.forEach((person) => {
          const row = document.createElement("tr");
          row.innerHTML = `<td>${person.name.name}</td><td>${person.status}</td><td>${person.name.contact}</td>`;
          table.appendChild(row);
        });

        wrapper.appendChild(table);
        // ✅ Show total count below the table
        const countInfo = document.createElement("p");
        countInfo.style.textAlign = "center";
        countInfo.style.fontWeight = "bold";
        countInfo.textContent = `Total records rendered: ${data.absentees.length}`;
        wrapper.appendChild(countInfo);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      document.getElementById("attendance-wrapper").innerHTML =
        "<p style='color:red;'>Error fetching data.</p>";
    }
  });

  // Search filter
  document.getElementById("searchInput").addEventListener("input", () => {
    const filter = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll(".attendance-table tr");

    rows.forEach((row, index) => {
      if (index === 0) return; // skip header
      const nameCell = row.querySelector("td");
      if (nameCell && nameCell.textContent.toLowerCase().includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
});
