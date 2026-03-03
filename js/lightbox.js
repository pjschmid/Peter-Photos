// ===============================
// Lightbox.js for Desktop + iPad
// ===============================

let thumbs = [];
let currentIndex = 0;
let lightboxOpen = false;

// Zoom & Drag
let scale = 1, translateX = 0, translateY = 0;
let isPinching = false, isDragging = false;
let startDistance = 0, startScale = 1;
let dragStartX = 0, dragStartY = 0;

// Swipe
let swipeStartX = 0, swipeDeltaX = 0;

document.addEventListener("DOMContentLoaded", () => {
  thumbs = Array.from(document.querySelectorAll(".thumb"));

  const lightbox = createLightbox();
  const content = lightbox.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");

  // --- Helpers ---
  function resetZoom() {
    scale = 1; translateX = 0; translateY = 0;
    const img = mediaContainer.querySelector("img");
    if (img) img.style.transform = "translate(0,0) scale(1)";
  }

  function updateTransform() {
    const img = mediaContainer.querySelector("img");
    if (img) img.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
  }

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function showImage(index) {
    currentIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[currentIndex];
    mediaContainer.innerHTML = `<img src="${thumb.src}" style="transition: transform 0.2s ease">`;

    // Optional captions & meta
    document.getElementById("lightbox-caption").textContent =
      thumb.closest(".gallery-item").querySelector(".caption")?.textContent || "";
    document.getElementById("lightbox-meta").textContent =
      [thumb.dataset.camera, thumb.dataset.lens, thumb.dataset.focal,
       thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
       thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
       thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
       thumb.dataset.note ? `${thumb.dataset.note}` : ""].filter(Boolean).join(" • ");

    resetZoom();
    lightbox.classList.add("show");
    lightboxOpen = true;
  }

  function closeLightbox() {
    mediaContainer.innerHTML = "";
    lightbox.classList.remove("show");
    lightboxOpen = false;
    resetZoom();
  }

  // --- Thumbnail clicks ---
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => showImage(i));
  });

  // --- Keyboard ---
  document.addEventListener("keydown", e => {
    if (!lightboxOpen) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(currentIndex-1);
    else if (e.key === "ArrowRight") showImage(currentIndex+1);
  });

  // --- Touch gestures ---
  content.addEventListener("touchstart", e => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (e.touches.length === 2) {
      isPinching = true;
      startDistance = getDistance(e.touches);
      startScale = scale;
    } else if (scale > 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
    } else {
      swipeStartX = e.touches[0].screenX;
      swipeDeltaX = 0;
    }
  }, { passive: false });

  content.addEventListener("touchmove", e => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const newDist = getDistance(e.touches);
      scale = Math.max(1, Math.min(startScale * (newDist/startDistance), 4));
      updateTransform();
    } else if (isDragging) {
      e.preventDefault();
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      updateTransform();
    } else {
      swipeDeltaX = e.touches[0].screenX - swipeStartX;
      content.style.transform = `translateX(${swipeDeltaX}px)`;
    }
  }, { passive: false });

  content.addEventListener("touchend", e => {
    if (!lightboxOpen) return;
    const threshold = 50;

    if (isPinching) { isPinching = false; return; }
    if (isDragging) { isDragging = false; return; }

    if (Math.abs(swipeDeltaX) > threshold) {
      if (swipeDeltaX < 0) showImage(currentIndex+1);
      else showImage(currentIndex-1);
    }

    content.style.transition = "transform 0.25s ease";
    content.style.transform = "translateX(0)";
  }, { passive: false });

  // --- Create Lightbox if missing ---
  function createLightbox() {
    const lb = document.createElement("div");
    lb.id = "lightbox";
    lb.innerHTML = `
      <div class="lightbox-content">
        <div id="lightbox-media"></div>
        <div id="lightbox-caption"></div>
        <div id="lightbox-meta"></div>
      </div>
      <div class="esc-hint">Esc → close</div>
    `;
    document.body.appendChild(lb);
    lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
    return lb;
  }
});
