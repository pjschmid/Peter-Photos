// ===============================
// CLEAN LIGHTBOX SCRIPT
// ===============================

let thumbs = [];
let currentIndex = -1;

// Zoom / Drag
let scale = 1;
let translateX = 0, translateY = 0;
let isPinching = false;
let isDraggingImage = false;
let dragStartX = 0, dragStartY = 0;
let startDistance = 0;
let startScale = 1;

// Swipe
let touchStartX = 0, touchEndX = 0;
let isSwiping = false;

// Lightbox state
let lightboxOpen = false;

document.addEventListener("DOMContentLoaded", () => {

  // Populate thumbs
  thumbs = Array.from(document.querySelectorAll(".thumb"));
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(thumb);
    });
  });

  // Insert lightbox HTML if missing
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
  const content = document.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");

  // -------------------
  // Helper functions
  // -------------------
  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function updateTransform(img) {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    const img = mediaContainer.querySelector("img");
    if (img) updateTransform(img);
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
      img.style.transition = "transform 0.2s ease";
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

  // -------------------
  // Keyboard
  // -------------------
  document.addEventListener("keydown", (e) => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      showImage(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      showImage(currentIndex + 1);
    }
  });

  // -------------------
  // Touch gestures
  // -------------------
  lightbox.addEventListener("touchstart", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (e.touches.length === 2) {
      isPinching = true;
      startDistance = getDistance(e.touches);
      startScale = scale;
      return;
    }

    if (scale > 1) {
      isDraggingImage = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
      return;
    }

    // swipe
    touchStartX = e.changedTouches[0].screenX;
    isSwiping = true;
    content.style.transition = "none";
  }, { passive: true });

  lightbox.addEventListener("touchmove", (e) => {
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    // pinch
    if (isPinching && e.touches.length === 2) {
      const newDistance = getDistance(e.touches);
      scale = Math.min(Math.max(startScale * (newDistance / startDistance), 1), 4);
      updateTransform(img);
      return;
    }

    // drag image
    if (isDraggingImage && scale > 1) {
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      updateTransform(img);
      return;
    }

    // swipe
    if (isSwiping && scale === 1) {
      touchEndX = e.changedTouches[0].screenX;
      const deltaX = touchEndX - touchStartX;
      content.style.transform = `translateX(${deltaX}px)`;
    }
  }, { passive: true });

  lightbox.addEventListener("touchend", () => {
    if (isPinching) { isPinching = false; return; }
    if (isDraggingImage) { isDraggingImage = false; return; }

    if (isSwiping) {
      const deltaX = touchEndX - touchStartX;
      const threshold = 70;
      content.style.transition = "transform 0.3s ease";

      if (deltaX < -threshold) {
        content.style.transform = "translateX(-100%)";
        setTimeout(() => showImage(currentIndex + 1), 250);
      } else if (deltaX > threshold) {
        content.style.transform = "translateX(100%)";
        setTimeout(() => showImage(currentIndex - 1), 250);
      } else {
        content.style.transform = "translateX(0)";
      }
      isSwiping = false;
    }
  }, { passive: true });

});
