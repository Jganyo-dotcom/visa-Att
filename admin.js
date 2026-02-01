// Fetch pending accounts
async function loadPending() {
  const res = await fetch("/api/pending");
  const users = await res.json();
  const list = document.getElementById("pendingList");
  list.innerHTML = "";
  users.forEach((u) => {
    const li = document.createElement("li");
    li.innerHTML = `${u.name} 
      <button class="approve" onclick="approveUser('${u.id}')">Approve</button>`;
    list.appendChild(li);
  });
}

// Fetch locked accounts
async function loadLocked() {
  const res = await fetch("/api/locked");
  const users = await res.json();
  const list = document.getElementById("lockedList");
  list.innerHTML = "";
  users.forEach((u) => {
    const li = document.createElement("li");
    li.innerHTML = `${u.name} 
      <button class="unblock" onclick="unblockUser('${u.id}')">Unblock</button>`;
    list.appendChild(li);
  });
}

// Attendance list
async function loadAttendance() {
  const res = await fetch("/api/staff");
  const staff = await res.json();
  const list = document.getElementById("attendanceList");
  list.innerHTML = "";
  staff.forEach((s) => {
    const li = document.createElement("li");
    li.innerHTML = `${s.name} 
      <button class="present" onclick="markPresent('${s.id}', this)">Present</button>`;
    list.appendChild(li);
  });
}

// Approve user
async function approveUser(id) {
  await fetch(`/api/approve/${id}`, { method: "POST" });
  loadPending();
}

// Unblock user
async function unblockUser(id) {
  await fetch(`/api/unblock/${id}`, { method: "POST" });
  loadLocked();
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

// Mark all present
async function markAllPresent() {
  await fetch("/api/attendance/markAll", { method: "POST" });
  loadAttendance();
}

// Search staff
document.getElementById("searchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll("#attendanceList li").forEach((li) => {
    li.style.display = li.textContent.toLowerCase().includes(term)
      ? ""
      : "none";
  });
});

// Initial load
loadPending();
loadLocked();
loadAttendance();
