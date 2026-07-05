//const baseApi = "http://127.0.0.1:4444/";

const baseApi = "https://attandance-app-1.onrender.com/";

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("ios-loader");
  const radioButtons = document.querySelectorAll('input[name="searchType"]');
  const searchBtn = document.getElementById("searchNewbiesBtn");

  const groupFull = document.getElementById("groupFull");
  const groupMonth = document.getElementById("groupMonth");
  const groupYear = document.getElementById("groupYear");

  const pageRotator = document.getElementById("pageRotator");

  // 1. Page Rotator Switch Management Layer Navigation Actions
  pageRotator.addEventListener("change", (e) => {
    const destinationPage = e.target.value;
    if (destinationPage) {
      window.location.href = `/${destinationPage}`;
    }
  });

  // 2. Manage Swapping Input Elements Based on Radio Choices
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const selectedType = e.target.value;

      // Hide all containers
      groupFull.classList.add("hidden");
      groupMonth.classList.add("hidden");
      groupYear.classList.add("hidden");

      // Show only targeted choice container
      if (selectedType === "full") groupFull.classList.remove("hidden");
      if (selectedType === "month") groupMonth.classList.remove("hidden");
      if (selectedType === "year") groupYear.classList.remove("hidden");
    });
  });

  // 3. Collect parameters and build API query string
  // 3. Collect parameters and build API query string (FIXED: Simplified parameter format)
  searchBtn.addEventListener("click", async () => {
    const activeSearchType = document.querySelector(
      'input[name="searchType"]:checked',
    ).value;

    // Base parameter URL initialization
    let endpointUrl = `${baseApi}api/admin/newbies?type=${activeSearchType}&value=`;

    if (activeSearchType === "full") {
      const fullDate = document.getElementById("queryDate").value; // Outputs: "YYYY-MM-DD"
      if (!fullDate) return alert("Please specify a calendar day.");
      endpointUrl += fullDate;
    } else if (activeSearchType === "month") {
      const monthInput = document.getElementById("queryMonth").value; // Outputs: "YYYY-MM"
      if (!monthInput) return alert("Please pick a calendar month target.");
      endpointUrl += monthInput;
    } else if (activeSearchType === "year") {
      const yearInput = document.getElementById("queryYear").value; // Outputs: "YYYY"
      if (!yearInput) return alert("Please specify a numeric search year.");
      endpointUrl += yearInput;
    }

    try {
      if (loader) loader.style.display = "flex";

      const token = localStorage.getItem("token");
      const res = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (loader) loader.style.display = "none";

      if (!res.ok) {
        alert(data.message || "Failed running database lookup routing matrix.");
        return;
      }

      renderNewbiesTable(data.newMembers || []);
    } catch (err) {
      if (loader) loader.style.display = "none";
      console.error(err);
      alert("Network exception error checking data strings.");
    }
  });

  // 4. Inject matching database data arrays into layout template table rows
  function renderNewbiesTable(members) {
    const tbody = document.getElementById("newbiesTableBody");
    const countDisplay = document.getElementById("resultsCount");

    countDisplay.textContent = members.length;
    tbody.innerHTML = "";

    if (members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #777;">No matching records located for this selection window.</td>
        </tr>`;
      return;
    }

    members.forEach((person) => {
      const row = document.createElement("tr");

      // Clean formatted local date text render helper parsing configuration
      const displayDate = person.dateJoined
        ? person.dateJoined.substring(0, 10)
        : "N/A";

      row.innerHTML = `
        <td><strong>${person.count || "-"}</strong></td>
        <td>${person.name}</td>
        <td><span class="badge-dept">${person.department}</span></td>
        <td>${person.gender || "-"}</td>
        <td>${person.level || "-"}</td>
        <td>${person.contact || "-"}</td>
        <td>${displayDate}</td>
      `;
      tbody.appendChild(row);
    });
  }
});
