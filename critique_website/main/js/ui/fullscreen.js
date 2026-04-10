export function initFullscreen() {
  const fullscreen = document.getElementById("fullscreen-view");
  const fullscreenImg = document.getElementById("fullscreen-img");

  if (!fullscreen || !fullscreenImg) return;

  // OPEN
  document.addEventListener("click", function (e) {
    const img = e.target.closest(".quote-card img");
    if (!img) return;

    fullscreenImg.src = img.src;
    fullscreen.classList.remove("hidden");

    setTimeout(() => {
      fullscreen.classList.add("active");
    }, 10);
  });

  // CLOSE (click outside image)
  fullscreen.addEventListener("click", (e) => {
    if (e.target === fullscreen) {
      closeFullscreen();
    }
  });

  // CLOSE (ESC key)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeFullscreen();
    }
  });

  function closeFullscreen() {
    fullscreen.classList.remove("active");

    setTimeout(() => {
      fullscreen.classList.add("hidden");
    }, 300);
  }
}