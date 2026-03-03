// ============================
// UNIVERSAL LIGHTBOX
// ============================

let thumbs = [];
let currentIndex = -1;

// Zoom / Drag
let scale = 1, translateX = 0, translateY = 0;
let isPinching = false, isDraggingImage = false;
let dragStartX = 0, dragStartY = 0;
let pinchStartDistance = 0, startScale = 1;
let originX = 0, originY = 0;

// Swipe
let touchStartX = 0, touchEndX = 0;
let isSwiping = false;

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

  // Inject lightbox HTML
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
  const content = document.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");

  // ----------------
  // HELPER FUNCTIONS
  // ----------------
  function updateTransform(img) {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1; translateX = 0; translateY = 0;
    const img = mediaContainer.querySelector("img");
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
      img.style.touchAction = "none";
      img.style.willChange = "transform";
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

  // ----------------
  // KEYBOARD
  // ----------------
  document.addEventListener("keydown", (e) => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

  // ----------------
  // TOUCH / SWIPE / PINCH
  // ----------------
  mediaContainer.addEventListener("touchstart", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (e.touches.length === 2) {
      isPinching = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistance = Math.sqrt(dx*dx + dy*dy);
      startScale = scale;

      originX = (e.touches[0].clientX + e.touches[1].clientX)/2;
      originY = (e.touches[0].clientY + e.touches[1].clientY)/2;
      img.style.transformOrigin = `${originX}px ${originY}px`;
      return;
    }

    if (scale > 1) {
      isDraggingImage = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
      return;
    }

    // swipe start
    touchStartX = e.touches[0].clientX;
    isSwiping = true;
    content.style.transition = "none";
  }, { passive: false });

  mediaContainer.addEventListener("touchmove", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;
    e.preventDefault();

    if (isPinching && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      let distance = Math.sqrt(dx*dx + dy*dy);
      let newScale = startScale * (distance / pinchStartDistance);
      scale += (newScale - scale) * 0.2;
      scale = Math.max(1, Math.min(scale, 4));
      updateTransform(img);
      return;
    }

    if (isDraggingImage && scale > 1) {
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      updateTransform(img);
      return;
    }

    if (isSwiping && scale === 1) {
      touchEndX = e.touches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      content.style.transform = `translateX(${deltaX}px)`;
    }
  }, { passive: false });

  mediaContainer.addEventListener("touchend", (e) => {
    if (isPinching) { isPinching = false; return; }
    if (isDraggingImage) { isDraggingImage = false; return; }

    if (isSwiping) {
      const deltaX = touchEndX - touchStartX;
      const threshold = 70;
      content.style.transition = "transform 0.3s ease";
      if (deltaX < -threshold) {
        content.style.transform = "translateX(-100%)";
        setTimeout(() => showImage(currentIndex+1), 250);
      } else if (deltaX > threshold) {
        content.style.transform = "translateX(100%)";
        setTimeout(() => showImage(currentIndex-1), 250);
      } else {
        content.style.transform = "translateX(0)";
      }
      isSwiping = false;
    }
  }, { passive: false });

});
