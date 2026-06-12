const overlay = document.getElementById("intro-overlay");

/* STOP if modal doesn't exist */
if (!overlay) {
  console.log("Intro modal not found on this page.");
} else {

  const label = overlay.querySelector(".intro-label");
  const title = overlay.querySelector(".intro-title");
  const text = overlay.querySelector(".intro-text");

  const button = document.getElementById("intro-btn");

  /* DATA ATTRIBUTES */
  const introKey = overlay.dataset.introKey;

  label.textContent = overlay.dataset.introLabel;
  title.textContent = overlay.dataset.introTitle;
  text.textContent = overlay.dataset.introText;

  /* SHOW INTRO */
  function showIntro() {

    overlay.classList.remove("hidden");

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      overlay.classList.add("show");
    }, 100);

  }

  /* CLOSE INTRO */
  function closeIntro() {

    overlay.classList.remove("show");

    setTimeout(() => {
      overlay.classList.add("hidden");
      document.body.style.overflow = "auto";
    }, 700);

    localStorage.setItem(introKey, "true");

  }

  /* FIRST VISIT CHECK */
  window.addEventListener("load", () => {

    const alreadySeen = localStorage.getItem(introKey);

    if (!alreadySeen) {

      setTimeout(() => {
        showIntro();
      }, 400);

    }

  });

  /* BUTTON EVENT */
  button.addEventListener("click", closeIntro);

  /* ESC SUPPORT */
  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
      closeIntro();
    }

  });

}