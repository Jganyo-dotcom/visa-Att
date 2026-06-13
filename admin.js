//const baseApi = "http://127.0.0.1:4444/";

const baseApi = "https://attandance-app-1.onrender.com/";



const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

document.addEventListener("DOMContentLoaded", () => {
  // Graceful Authorization Shield Check Exception
  if (!token || !user) {
    alert("Not authorized!");
    window.location.href = "auth.html";
    return;
  }

  // Enforce Specific Structural Organization Logic Settings
  if (user.org === "Teens") {
    const visaLevelsEl = document.getElementById("VisaLevels");
    if (visaLevelsEl) {
      visaLevelsEl.style.display = "none";
      visaLevelsEl.removeAttribute("required");
    }
  }



  // Loader Controls
  function showLoader() {
    const overlay = document.getElementById("loaderrOverlay");
    if (overlay) overlay.style.display = "flex";
  }

  function hideLoader() {
    const overlay = document.getElementById("loaderrOverlay");
    if (overlay) overlay.style.display = "none";
  }

  // Render User Context Profile Layout Identity Data Safely
  const welcomeEl = document.getElementById("welcome");
  if (welcomeEl) {
    welcomeEl.innerHTML = `Welcome ${user.username}`;
  }
  console.log("Dashboard system modules loaded cleanly.");

  if (document.getElementById("refreshit")) {
    const refreshBtn = document.getElementById("refreshit");
    refreshBtn.addEventListener("click", Refresh);
  }

  // Asynchronous Fetch Blocks Engine logic for locked accounts
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
        console.error("Error payload validation failed:", result);
        return;
      }

      const list = document.getElementById("lockedList");
      if (!list) return;
      list.innerHTML = "";

      if (result && result.data) {
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
      }
    } catch (err) {
      console.error("Error loading locked accounts architecture:", err);
    }
  }

  // Unblock Selected Member Action Context Function Logic
  async function unblockUser(id) {
    try {
      if (!token) {
        alert("Not authorized!");
        window.location.href = "auth.html";
        return;
      }

      const res = await fetch(baseApi + `api/admin/unblock/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to unblock user");
        console.error("Error processing parameters configuration:", data);
        return;
      }

      if (data.message) {
        alert(data.message);
      }

      loadLocked();
    } catch (err) {
      console.error("Network interface exceptions caught:", err);
      alert("Network error!");
    }
  }

  // const signOutDesktop = document.getElementById("signOutBtn");
  // const signOutMobile = document.getElementById("signOutBtnMobile");

  // function handleSignOut() {
  //   sessionStorage.removeItem("token");
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   window.location.href = "/auth.html";
  // }

  // if (signOutDesktop) signOutDesktop.addEventListener("click", handleSignOut);
  // if (signOutMobile) signOutMobile.addEventListener("click", handleSignOut);

  // Administrative Delete Action Command Orchestrator logic
  async function deleteStaff(staffId, btn) {
    try {
      const response = await fetch(baseApi + `api/admin/delete/${staffId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Failed to delete staff: " + errorData.message);
        return;
      }

      if (btn && btn.parentElement) {
        btn.parentElement.remove();
      }
      alert("Staff deleted successfully");
    } catch (err) {
      console.error("Error modifying data tracking metrics:", err);
      alert("Something went wrong while deleting staff");
    }
  }

  function capitalise(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Primary Creation Form Handlers
  const form = document.getElementById("createPersonForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (!token) {
        alert("Not authorized!");
        window.location.href = "auth.html";
        return;
      }

      const person = {
        name: capitalise(document.getElementById("name").value),
        department: capitalise(document.getElementById("department").value),
        gender: document.getElementById("gender").value,
      };
      
      const contact = document.getElementById("contact").value.trim();
      if (contact.length > 0) {
        person.contact = contact;
      }

      if (user.org !== "Teens") {
        const visaLevelsEl = document.getElementById("VisaLevels");
        if (visaLevelsEl) {
          person.level = visaLevelsEl.value;
        }
      }

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
          console.error("Payload error feedback context received:", data);
          return;
        }
        
        alert(data.message || "Person created successfully!");
        form.reset();
      } catch (err) {
        hideLoader();
        console.error("Network handling stack execution issues detected:", err);
        alert("Network error!");
      }
    });
  }

  // const hamburgerBtn = document.getElementById("hamburgerBtn");
  // const sideMenu = document.getElementById("sideMenu");
  // const closeMenuBtn = document.getElementById("closeMenuBtn");
  // const openBtnDesktop = document.getElementById("changePasswordBtn");

  // // Off-canvas Side Drawer Drawer Event Binding Logic
  // if (hamburgerBtn && sideMenu) {
  //   hamburgerBtn.addEventListener("click", () => {
  //     sideMenu.classList.toggle("active");
  //     if (sideMenu.classList.contains("active")) {
  //       hamburgerBtn.innerHTML = "&times;";
  //     } else {
  //       hamburgerBtn.innerHTML = "&#9776;";
  //     }
  //   });
  // }

  // if (closeMenuBtn && sideMenu && hamburgerBtn) {
  //   closeMenuBtn.addEventListener("click", () => {
  //     sideMenu.classList.remove("active");
  //     hamburgerBtn.innerHTML = "&#9776;";
  //   });
  // }

  // window.addEventListener("click", (e) => {
  //   if (sideMenu && hamburgerBtn && !sideMenu.contains(e.target) && e.target !== hamburgerBtn) {
  //     sideMenu.classList.remove("active");
  //     hamburgerBtn.innerHTML = "&#9776;";
  //   }
  // });

  // Modal Open Trigger Event Listeners
  // if (openBtnDesktop && modal) {
  //   openBtnDesktop.addEventListener("click", () => {
  //     modal.style.display = "flex";
  //   });
  // }

  // if (closeBtn && modal) {
  //   closeBtn.addEventListener("click", () => {
  //     modal.style.display = "none";
  //   });
  // }

  // window.addEventListener("click", (e) => {
  //   if (user && user.hasChangedPassword === true && e.target === modal) {
  //     modal.style.display = "none";
  //   }
  // });

  // Account Self-Destruct Operations Handler Block logic
  const deleteAccountBtn = document.getElementById("deleteAccount");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      );
      if (!confirmed) return;

      try {
        const activeToken = sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch(baseApi + `api/admin/${user.id}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
        });

        if (res.ok) {
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/auth.html";
        } else {
          const data = await res.json();
          alert("Error deleting account: " + data.message);
        }
      } catch (err) {
        console.error("Delete target security context execution error:", err);
        alert("Server error deleting account");
      }
    });
  }

  // Password Modification Management form handling logic
  // const formm = document.getElementById("changePasswordForm");
  // if (formm) {
  //   formm.addEventListener("submit", async (e) => {
  //     e.preventDefault();

  //     const currentPassword = document.getElementById("currentPassword").value;
  //     const newPassword = document.getElementById("newPassword").value;
  //     const confirmPassword = document.getElementById("confirmPassword").value;

  //     try {
  //       showLoader();
  //       const response = await fetch(
  //         baseApi + `api/admin/change-password/${user.id}`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //           body: JSON.stringify({
  //             currentPassword,
  //             newPassword,
  //             confirmPassword,
  //           }),
  //         },
  //       );

  //       const data = await response.json();
  //       hideLoader();
        
  //       if (response.ok) {
  //         alert("Password updated successfully!");
  //         if (modal) modal.style.display = "none";
  //         handleSignOut();
  //       } else {
  //         alert(data.message || data.error || "Error updating password");
  //       }
  //     } catch (err) {
  //       hideLoader();
  //       console.error("Auth change lifecycle fault verification details:", err);
  //       alert("Something went wrong");
  //     }
  //   });
  // }

  // // Central Routing Engine Control Mapping Handlers
  // const routeMappings = {
  //   "peoplePage": "/people",
  //   "database": "/database",
  //   "profilePage": "/profile",
  //   "analysisPage": "/analysis",
  //   "code": "/qrcode",
  //   "tend": "/Attend",
  //   "MA": "/markAttendace",
  //   "followPage": "/GHYYK",
  //   "sessionM": "/sessionManagement",
  //   "DoubleServicePage": "/DD"
  // };

  // Object.entries(routeMappings).forEach(([elementId, path]) => {
  //   const el = document.getElementById(elementId);
  //   if (el) {
  //     el.addEventListener("click", () => navigateTo(path));
  //   }
  // });
});
 // const createSessionBtn = document.getElementById("createSessionBtn");

  // // initialize button state based on localStorage
  // if (localStorage.getItem("sessionId")) {
  //   createSessionBtn.textContent = "Close Session";
  //   createSessionBtn.classList.add("danger");
  // } else {
  //   createSessionBtn.textContent = "✨ Create Session ✨";
  // }

  // createSessionBtn.addEventListener("click", async () => {
  //   if (createSessionBtn.textContent === "✨ Create Session ✨") {
  //     await CreateSession();
  //   } else {
  //     CloseSession();
  //   }
  // });

  // async function CreateSession() {
  //   try {
  //     const confirmed = window.confirm("Do you really want to open a session?");
  //     if (!confirmed) return;

  //     if (!token) {
  //       alert("Not authorized!");
  //       window.location.href = "auth.html";
  //       return;
  //     }

  //     // ✅ Show loader
  //     document.getElementById("ios-loader").style.display = "flex";

  //     const res = await fetch(baseApi + "api/create-session", {
  //       method: "GET", // backend expects GET
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + token,
  //       },
  //     });

  //     const contentType = res.headers.get("Content-Type");

  //     if (
  //       contentType &&
  //       contentType.includes(
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //       )
  //     ) {
  //       // It's an Excel file → trigger download
  //       const blob = await res.blob();
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement("a");
  //       a.href = url;

  //       let filename = "attendance.xlsx";
  //       const disposition = res.headers.get("Content-Disposition");
  //       if (disposition && disposition.includes("filename=")) {
  //         filename = disposition.split("filename=")[1];
  //       }
  //       a.download = filename;

  //       document.body.appendChild(a);
  //       a.click();
  //       a.remove();
  //       window.URL.revokeObjectURL(url);

  //       return; // stop here, file downloaded
  //     }

  //     const data = await res.json();

  //     if (!res.ok) {
  //       alert(data.message || data.error || "Failed to create session");
  //       console.error("Error creating session:", data);
  //       return;
  //     }

  //     if (data.message) {
  //       alert(data.message);
  //     }

  //     if (data.newSession?._id) {
  //       localStorage.setItem("sessionId", data.newSession._id);

  //       // ✅ toggle button text and style
  //       createSessionBtn.textContent = "Close Session";
  //       createSessionBtn.classList.add("danger");
  //     }
  //   } catch (err) {
  //     console.error("Network error creating session:", err);
  //     alert("Network error!");
  //   } finally {
  //     // ✅ Hide loader
  //     document.getElementById("ios-loader").style.display = "none";
  //   }
  // }

  // async function CloseSession() {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const sessionId = localStorage.getItem("sessionId");

  //     if (!token || !sessionId) {
  //       alert("No active session found");
  //       return;
  //     }

  //     const confirmed = confirm("Session will close when you click OK?");
  //     if (!confirmed) {
  //       alert("Session close cancelled");
  //       return;
  //     }

  //     // ✅ Show loader
  //     document.getElementById("ios-loader").style.display = "flex";

  //     const res = await fetch(baseApi + `api/close-session/${sessionId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + token,
  //       },
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       alert(data.message || "Failed to close session");
  //       console.error("Error closing session:", data);
  //       return;
  //     }

  //     if (data.message) {
  //       alert(data.message);
  //     }

  //     // ✅ Clear localStorage and toggle button text
  //     localStorage.removeItem("sessionId");
  //     console.log("Session cleared from localStorage");

  //     createSessionBtn.textContent = "✨ Create Session ✨";
  //     createSessionBtn.classList.remove("danger");
  //   } catch (err) {
  //     console.error("Network error closing session:", err);
  //     alert("Network error!");
  //   } finally {
  //     // ✅ Hide loader
  //     document.getElementById("ios-loader").style.display = "none";
  //   }
  // }

  // document.getElementById("printBtn").addEventListener("click", async () => {
  //   try {
  //     const session = localStorage.getItem("sessionId");
  //     const response = await fetch(
  //       baseApi + `api/admin/export-attendance/${session}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: "Bearer " + token,
  //         },
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to download file");
  //     }

  //     // Convert response to blob
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);

  //     // Use filename from backend headers
  //     const disposition = response.headers.get("Content-Disposition");
  //     let filename = "attendance.xlsx";
  //     if (disposition && disposition.includes("filename=")) {
  //       filename = disposition.split("filename=")[1];
  //     }

  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();

  //     window.URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error("Error downloading attendance:", err);
  //     alert("Failed to download attendance file");
  //   }
  // });

  // document.getElementById("staffPage").addEventListener("click", () => {
  //   console.log("ha");
  //   window.location.href = "/staffManagement.html";
  // });


