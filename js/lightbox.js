 // ===============================
// LIGHTBOX.JS – Clean Version
// ===============================

let thumbs = [];
let currentIndex = -1;

// Zoom / drag
let scale = 1;
let translateX = 0, translateY = 0;
let lastTouchDistance = 0;
let isPinching = false;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;

// Swipe
let isSwiping = false;
let swipeStartX = 0;
let swipeDeltaX = 0;

// Lightbox state
let lightboxOpen = false;

document.addEventListener("DOMContentLoaded", () => {

  // Populate thumbs
  thumbs = Array.from(document.querySelectorAll(".thumb"));
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", e => {
      e.preventDefault();
      openLightbox(thumb);
    });
  });

  // Insert lightbox if missing
  if (!document.getElementById("lightbox")) {
    const lightboxHTML = `
      <div id="lightbox">
        <div class="lightbox-content">
          <div id="lightbox-media"></div>
          <div id="lightbox-caption"></div>
          <div id="lightbox-meta"></div>
        </div>
        <div class="esc-hint">Esc → close</div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", lightboxHTML);
  }

  const lightbox = document.getElementById("lightbox");
  const content = lightbox.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");

  // -------------------
  // Helpers
  // -------------------
  function updateTransform(img) {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    const img = mediaContainer.querySelector("img");
    if (img) img.style.transition = "transform 0.2s ease";
    if (img) updateTransform(img);
  }

  function showImage(index) {
    if (thumbs.length === 0) return;
    currentIndex = (index + thumbs.length) % thumbs.length;

    mediaContainer.innerHTML = "";
    resetZoom();

    const thumb = thumbs[currentIndex];
    const type = thumb.dataset.type || "image";

    if (type === "video") {
      const video = document.createElement("video");
      video.src = thumb.dataset.video || thumb.src;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      mediaContainer.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = thumb.src;
      img.style.transition = "transform 0.2s ease";
      mediaContainer.appendChild(img);
    }

    document.getElementById("lightbox-caption").textContent =
      thumb.closest(".gallery-item")?.querySelector(".caption")?.textContent || "";

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

  // -------------------
  // Keyboard
  // -------------------
  document.addEventListener("keydown", e => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    else if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

  // -------------------
  // Touch gestures
  // -------------------
  lightbox.addEventListener("touchstart", e => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");

    if (e.touches.length === 2 && img) {
      // Pinch start
      isPinching = true;
      lastTouchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      return;
    }

    if (img && scale > 1) {
      // Drag start
      isDragging = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
      return;
    }

    // Swipe start
    isSwiping = true;
    swipeStartX = e.touches[0].clientX;
    swipeDeltaX = 0;
    content.style.transition = "none";

  }, { passive: true });

  lightbox.addEventListener("touchmove", e => {
    const img = mediaContainer.querySelector("img");
    if (!lightboxOpen) return;

    if (isPinching && e.touches.length === 2 && img) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      let delta = currentDistance / lastTouchDistance;
      scale = Math.min(Math.max(scale * delta, 1), 4);
      lastTouchDistance = currentDistance;
      updateTransform(img);
      return;
    }

    if (isDragging && img) {
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      updateTransform(img);
      return;
    }

    if (isSwiping) {
      swipeDeltaX = e.touches[0].clientX - swipeStartX;
      content.style.transform = `translateX(${swipeDeltaX}px)`;
    }
  }, { passive: true });

  lightbox.addEventListener("touchend", e => {
    if (isPinching) { isPinching = false; return; }
    if (isDragging) { isDragging = false; return; }

    if (isSwiping) {
      const threshold = 70;
      content.style.transition = "transform 0.3s ease";

      if (swipeDeltaX < -threshold) showImage(currentIndex + 1);
      else if (swipeDeltaX > threshold) showImage(currentIndex - 1);
      else content.style.transform = "translateX(0)";

      isSwiping = false;
    }
  }, { passive: true });

});
