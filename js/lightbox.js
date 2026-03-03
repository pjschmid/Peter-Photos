// ===============================
// FULL LIGHTBOX SCRIPT
// ===============================

let thumbs = [];
let currentIndex = -1;
let lightboxOpen = false;

// Zoom / Drag
let scale = 1;
let translateX = 0, translateY = 0;
let isPinching = false;
let isDraggingImage = false;
let dragStartX = 0, dragStartY = 0;
let startDistance = 0, startScale = 1;

// Swipe
let touchStartX = 0, touchEndX = 0;
let isSwiping = false;

// --------------------------
// Helpers
// --------------------------
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
  const img = document.querySelector("#lightbox-media img");
  if (img) updateTransform(img);
}

// --------------------------
// Show / Open / Close
// --------------------------
function showImage(index) {
  if (thumbs.length === 0) return;
  currentIndex = (index + thumbs.length) % thumbs.length;

  const mediaContainer = document.getElementById("lightbox-media");
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
    thumb.closest(".gallery-item")?.querySelector(".caption")?.textContent || "";

  document.getElementById("lightbox-meta").textContent =
    [
      thumb.dataset.camera,
      thumb.dataset.lens,
      thumb.dataset.focal,
      thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
      thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
      thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
      thumb.dataset.note ? thumb.dataset.note : ""
    ].filter(Boolean).join(" • ");

  resetZoom();
  lightboxOpen = true;
  document.getElementById("lightbox").classList.add("show");
}

function openLightbox(thumb) {
  const index = thumbs.indexOf(thumb);
  if (index !== -1) showImage(index);
}

function closeLightbox() {
  lightboxOpen = false;
  resetZoom();
  document.getElementById("lightbox-media").innerHTML = "";
  document.getElementById("lightbox").classList.remove("show");
}

// --------------------------
// Initialization
// --------------------------
document.addEventListener("DOMContentLoaded", () => {
  thumbs = Array.from(document.querySelectorAll(".thumb"));
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(thumb);
    });
  });

  if (!document.getElementById("lightbox")) {
    const lightboxHTML = `
      <div id="lightbox" style="touch-action:none">
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
  // Keyboard
  // -------------------
  document.addEventListener("keydown", (e) => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    else if (e.key === "ArrowRight") showImage(currentIndex + 1);
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
      e.preventDefault();
      return;
    }

    if (scale > 1) {
      isDraggingImage = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
      e.preventDefault();
      return;
    }

    // swipe start
    if (scale === 1) {
      touchStartX = e.touches[0].clientX;
      touchEndX = touchStartX;
      isSwiping = true;
      content.style.transition = "none";
    }
  }, { passive: false });

  lightbox.addEventListener("touchmove", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (isPinching && e.touches.length === 2) {
      const newDistance = getDistance(e.touches);
      scale = Math.min(Math.max(startScale * (newDistance / startDistance), 1), 4);
      updateTransform(img);
      e.preventDefault();
      return;
    }

    if (isDraggingImage && scale > 1) {
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      updateTransform(img);
      e.preventDefault();
      return;
    }

    if (isSwiping && scale === 1) {
      touchEndX = e.touches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      content.style.transform = `translateX(${deltaX}px)`;
      e.preventDefault();
    }
  }, { passive: false });

  lightbox.addEventListener("touchend", () => {
    if (isPinching) { isPinching = false; return; }
    if (isDraggingImage) { isDraggingImage = false; return; }

    if (isSwiping) {
      const deltaX = touchEndX - touchStartX;
      const threshold = 70;
      content.style.transition = "transform 0.3s ease";

      if (deltaX < -threshold) {
        content.style.transform = "translateX(-100%)";
        setTimeout(() => { content.style.transform="translateX(0)"; showImage(currentIndex + 1); }, 250);
      } else if (deltaX > threshold) {
        content.style.transform = "translateX(100%)";
        setTimeout(() => { content.style.transform="translateX(0)"; showImage(currentIndex - 1); }, 250);
      } else {
        content.style.transform = "translateX(0)";
      }

      isSwiping = false;
    }
  }, { passive: false });

});
