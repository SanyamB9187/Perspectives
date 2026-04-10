export function initSlider() {
  const slides = document.querySelectorAll(".slide");
  const bars = document.querySelectorAll(".bar");

  if (slides.length === 0 || bars.length === 0) return;

  let index = 0;

  function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));

    bars.forEach(bar => {
      bar.classList.remove("active");
      const span = bar.querySelector("span");
      if (span) {
        span.style.animation = "none";
        void span.offsetWidth;
      }
    });

    slides[i].classList.add("active");

    bars[i].classList.add("active");
    const span = bars[i].querySelector("span");
    if (span) {
      span.style.animation = "fillBar 5s linear forwards";
    }
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  showSlide(index);
  setInterval(nextSlide, 5000);
}