function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

const menu = document.getElementById("getStarted");

menu.addEventListener("click", () => {
  // Redirect to the auth page
  window.location.href = "auth.html";
});

// Attach navigation to Sign In / Sign Up links
document.querySelectorAll("nav a, #menu a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault(); // prevent default # behavior
    window.location.href = "auth.html";
  });
});
