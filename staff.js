// Load staff attendance list
async function loadStaffAttendance() {
  const res = await fetch("/api/staff");
  const staff = await res.json();
  const list = document.getElementById("staffAttendanceList");
  list.innerHTML = "";
  staff.forEach((s) => {
    const li = document.createElement("li");
    li.innerHTML = `${s.name} 
      <button class="present" onclick="markPresent('${s.id}', this)">Present</button>`;
    list.appendChild(li);
  });
}

// Mark present
async function markPresent(id, btn) {
  await fetch(`/api/attendance/${id}`, { method: "POST" });
  btn.textContent = "Marked";
  btn.className = "undo";
  btn.onclick = () => undoPresent(id, btn);
}

// Undo present
async function undoPresent(id, btn) {
  await fetch(`/api/attendance/${id}/undo`, { method: "POST" });
  btn.textContent = "Present";
  btn.className = "present";
  btn.onclick = () => markPresent(id, btn);
}

// Search staff
document.getElementById("staffSearch").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll("#staffAttendanceList li").forEach((li) => {
    li.style.display = li.textContent.toLowerCase().includes(term)
      ? ""
      : "none";
  });
});

// Initial load
loadStaffAttendance();
