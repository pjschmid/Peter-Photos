// ============================
// LIGHTBOX.JS - CLEAN VERSION
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

  thumbs = Array.from(document.querySelectorAll(".thumb"));
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(thumb);
    });
  });

  // Inject lightbox container if missing
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

  // ---------------------------
  // Helpers
  // ---------------------------
  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
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
      [
        thumb.dataset.camera,
        thumb.dataset.lens,
        thumb.dataset.focal,
        thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
        thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
        thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
        thumb.dataset.note ? `${thumb.dataset.note}` : ""
      ].filter(Boolean).join(" • ");

    resetZoom();
    lightboxOpen = true;
    lightbox.classList.add("show");
  }

  function openLightbox(thumb) {
    const index = thumbs.indexOf(thumb);
    if (index !== -1) showImage(index);
  }

  function closeLightbox() {
    lightboxOpen = false;
    resetZoom();
    mediaContainer.innerHTML = "";
    lightbox.classList.remove("show");
  }

  // ---------------------------
  // Keyboard
  // ---------------------------
  document.addEventListener("keydown", (e) => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    else if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

  // ---------------------------
  // Touch gestures
  // ---------------------------
  lightbox.addEventListener("touchstart", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (e.touches.length === 2) {
      isPinching = true;
      startDistance = getDistance(e.touches);
      startScale = scale;
    } else if (scale > 1 && e.touches.length === 1) {
      isDraggingImage = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
    } else if (scale === 1 && e.touches.length === 1) {
      isSwiping = true;
      touchStartX = e.touches[0].clientX;
      content.style.transition = "none";
    }
  }, { passive: true });

  lightbox.addEventListener("touchmove", (e) => {
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (isPinching && e.touches.length === 2) {
      const newDist = getDistance(e.touches);
      scale = Math.min(Math.max(startScale * (newDist / startDistance), 1), 4);
      img.style.transform = `translate3d(${translateX}px,${translateY}px,0) scale(${scale})`;
    } else if (isDraggingImage) {
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      img.style.transform = `translate3d(${translateX}px,${translateY}px,0) scale(${scale})`;
    } else if (isSwiping) {
      const deltaX = e.touches[0].clientX - touchStartX;
      content.style.transform = `translate3d(${deltaX}px,0,0)`;
    }
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    if (isPinching) { isPinching = false; return; }
    if (isDraggingImage) { isDraggingImage = false; return; }

    if (isSwiping) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const threshold = 70;
      content.style.transition = "transform 0.3s ease";

      if (deltaX < -threshold) showImage(currentIndex + 1);
      else if (deltaX > threshold) showImage(currentIndex - 1);
      else content.style.transform = `translate3d(0,0,0)`;

      isSwiping = false;
    }
  });

});

