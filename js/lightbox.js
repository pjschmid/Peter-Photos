// ============================
// LIGHTBOX.JS - STABLE VERSION
// ============================

let thumbs = [];
let currentIndex = -1;

// Zoom / drag
let scale = 1, translateX = 0, translateY = 0;
let startDistance = 0, startScale = 1;
let isPinching = false, isDraggingImage = false, dragStartX = 0, dragStartY = 0;

// Swipe
let touchStartX = 0, isSwiping = false;

// Lightbox state
let lightboxOpen = false;

document.addEventListener("DOMContentLoaded", () => {

  // Grab all thumbnails
  thumbs = Array.from(document.querySelectorAll(".thumb"));
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(thumb);
    });
  });

  // Inject lightbox if missing
  if (!document.getElementById("lightbox")) {
    const html = `
      <div id="lightbox">
        <div class="lightbox-content">
          <div id="lightbox-media"></div>
          <div id="lightbox-caption"></div>
          <div id="lightbox-meta"></div>
        </div>
        <div class="esc-hint">Esc → close</div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  const lightbox = document.getElementById("lightbox");
  const content = lightbox.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");

  function resetZoom() {
    scale = 1; translateX = 0; translateY = 0;
    const img = mediaContainer.querySelector("img");
    if (img) img.style.transform = `translate3d(0,0,0) scale(1)`;
  }

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function showImage(index) {
    if (thumbs.length === 0) return;
    currentIndex = (index + thumbs.length) % thumbs.length;
    mediaContainer.innerHTML = "";

    const thumb = thumbs[currentIndex];
    const type = thumb.dataset.type || "image";

    if (type === "video") {
      const video = document.createElement("video");
      video.src = thumb.dataset.video;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      mediaContainer.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = thumb.src;
      img.style.transition = "transform 0.1s ease";
      mediaContainer.appendChild(img);
    }

    document.getElementById("lightbox-caption").textContent =
      thumb.closest(".gallery-item").querySelector(".caption")?.textContent || "";

    document.getElementById("lightbox-meta").textContent =
      [thumb.dataset.camera, thumb.dataset.lens, thumb.dataset.focal,
       thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
       thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
       thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
       thumb.dataset.note ? `${thumb.dataset.note}` : ""].filter(Boolean).join(" • ");

    resetZoom();
    lightboxOpen = true;
    lightbox.classList.add("show");
  }

  function openLightbox(thumb) { showImage(thumbs.indexOf(thumb)); }
  function closeLightbox() { lightboxOpen = false; resetZoom(); mediaContainer.innerHTML = ""; lightbox.classList.remove("show"); }

  // -----------------------
  // Keyboard navigation
  // -----------------------
window.addEventListener("keydown", (e) => {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox || !lightbox.classList.contains("show")) return;

    if (e.repeat) return;

    if (e.key === "Escape") {
        closeLightbox();
    } else if (e.key === "ArrowLeft") {
        showImage(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
        showImage(currentIndex + 1);
    }
});

