// --- Advanced Kinetic Navigation & Layout Control ---
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navActionsMenu = document.getElementById("navActionsMenu");
const navButtons = document.querySelectorAll(".nav-actions button");

mobileMenuBtn.addEventListener("click", () => {
  const isOpen = mobileMenuBtn.classList.toggle("open");
  navActionsMenu.classList.toggle("open");

  if (isOpen) {
    navButtons.forEach((btn, index) => {
      btn.style.opacity = "0";
      btn.style.transform = "translateX(40px) scale(0.95)";
      btn.style.transition = `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.08 + index * 0.06}s`;

      requestAnimationFrame(() => {
        btn.style.opacity = "1";
        btn.style.transform = "translateX(0) scale(1)";
      });
    });
  } else {
    navButtons.forEach((btn) => {
      btn.style.transform = "none";
      btn.style.opacity = "1";
    });
  }
});

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    mobileMenuBtn.classList.remove("open");
    navActionsMenu.classList.remove("open");
  });
});

// --- Dynamic Interactive Card Spotlight Tracking ---
const spotlightCards = document.querySelectorAll(
  ".feature-showcase-card, .dashboard-preview-window",
);
spotlightCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

// --- High-Performance Scroll Reveal Engine ---
const revealElements = document.querySelectorAll(".reveal");
const featureCards = document.querySelectorAll(".feature-showcase-card");

featureCards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 0.08}s`;
});

const handleScrollReveal = () => {
  const triggerBottom = window.innerHeight - 60;

  revealElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    if (elementTop < triggerBottom) {
      element.classList.add("active");
    }
  });
};

let scrollTimeout;
window.addEventListener("scroll", () => {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      handleScrollReveal();
      scrollTimeout = null;
    }, 12);
  }
});
window.addEventListener("load", handleScrollReveal);

// --- Active Dashboard Mock Registries ---
const mockDataRegistry = {
  teens: {
    total: 477,
    females: 252,
    males: 225,
    barVisa: "45%",
    barTeens: "85%",
    barWelfare: "60%",
  },
  visa: {
    total: 318,
    females: 142,
    males: 176,
    barVisa: "90%",
    barTeens: "30%",
    barWelfare: "40%",
  },
};

function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 5);

    obj.innerText = Math.floor(easeProgress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function handleMockOrgChange(targetOrg) {
  const targetDataset = mockDataRegistry[targetOrg];
  if (!targetDataset) return;

  const prevTotal =
    parseInt(document.getElementById("count-total").innerText) || 0;
  const prevFemales =
    parseInt(document.getElementById("count-females").innerText) || 0;
  const prevMales =
    parseInt(document.getElementById("count-males").innerText) || 0;

  animateValue("count-total", prevTotal, targetDataset.total, 900);
  animateValue("count-females", prevFemales, targetDataset.females, 800);
  animateValue("count-males", prevMales, targetDataset.males, 800);

  document.getElementById("bar-visa").style.height = targetDataset.barVisa;
  document.getElementById("bar-teens").style.height = targetDataset.barTeens;
  document.getElementById("bar-welfare").style.height =
    targetDataset.barWelfare;
}

function triggerMockSync() {
  const totalField = document.getElementById("count-total");
  if (!totalField) return;

  totalField.style.transform = "scale(1.3) translateY(-6px)";
  totalField.style.color = "var(--primary)";
  totalField.style.textShadow = "0 0 25px var(--primary-glow)";
  totalField.style.transition =
    "all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.5)";

  setTimeout(() => {
    const currentNum = parseInt(totalField.innerText) || 0;
    totalField.innerText = currentNum + 1;

    totalField.style.transform = "scale(1) translateY(0)";
    totalField.style.color = "#ffffff";
    totalField.style.textShadow = "none";
    totalField.style.transition = "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
  }, 100);
}

// --- 🎯 Premium Dashboard Router Target Handler ---
// --- 🎯 Role-Based Dynamic Dashboard Router Target Handler ---
const navigateDashBtn = document.getElementById("navigateDash");

if (navigateDashBtn) {
  navigateDashBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // 1. Premium elastic compression tactile feedback animation
    navigateDashBtn.style.transform = "scale(0.94) translateY(1px)";
    navigateDashBtn.style.opacity = "0.85";

    setTimeout(() => {
      // 2. Extract authorization security credentials from local storage
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // Safety Guard: If not authenticated, take them back to log in/register
      if (!token || !storedUser) {
        alert("Please login or create an account first!");
        window.location.href = "/auth.html"; // Adjust to your auth page file name
        return;
      }

      try {
        const user = JSON.parse(storedUser);

        // 3. Intelligent Role Distribution Router Routing Matrix
        if (user.role === "Admin") {
          window.location.href = "/admin.html";
        } else if (user.role === "Staff") {
          window.location.href = "/staff.html";
        } else if (user.role === "Manager") {
          window.location.href = "/manager.html";
        } else {
          alert(
            "Unknown organizational role detected. Contact administration.",
          );
          window.location.href = "/auth.html";
        }
      } catch (error) {
        console.error("Failed to parse user data session payload:", error);
        window.location.href = "/auth.html";
      }
    }, 180); // Executes right as the button pop animation finishes
  });
}
