//const baseApi = "http://127.0.0.1:4444/";
const baseApi = "https://attandance-app-1.onrender.com/";
const token = localStorage.getItem("token");

let html5QrcodeScanner;

document.getElementById("openScannerBtn").addEventListener("click", () => {
  document.getElementById("scannerModal").style.display = "block";

  html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", {
    fps: 10,
    qrbox: 250,
  });
  html5QrcodeScanner.render(onScanSuccess, onScanError);
});

function closeScanner() {
  document.getElementById("scannerModal").style.display = "none";
  document.getElementById("scan-result").innerHTML = "";
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear();
  }
  lastScannedId = null; // reset so you can scan again later
}

let lastScannedId = null;

function onScanSuccess(decodedText, decodedResult) {
  if (decodedText === lastScannedId) return; // skip duplicate scans
  lastScannedId = decodedText;

  document.getElementById("scan-result").innerHTML =
    "✅ Scanned ID: " + decodedText + "<br>Fetching person...";

  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];

  fetch(baseApi + `api/get-person/${decodedText}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((person) => {
      if (!person || !person.name) {
        document.getElementById("scan-result").innerHTML =
          `<div style="color:red;">Person not found for ID ${decodedText}</div>`;
        return;
      }

      const fakeBtn = document.createElement("button");
      markPresent(decodedText, fakeBtn);

      document.getElementById("scan-result").innerHTML =
        `<div style="margin-top:10px;color:green;font-weight:bold;">
           <strong>${person.name}</strong>  ${today}
        </div>`;
    })
    .catch((err) => {
      console.error("Error fetching person:", err);
      document.getElementById("scan-result").innerHTML =
        `<div style="color:red;">Error fetching person details</div>`;
    });
}

function onScanError(errorMessage) {
  // Ignore "No MultiFormat Readers..." errors
  if (!errorMessage.includes("No MultiFormat Readers")) {
    console.warn("QR Scan Error:", errorMessage);
  }
}

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
