let thumbs = [];
let currentIndex = -1;

// Zoom / Drag
let scale = 1, translateX = 0, translateY = 0;
let startScale = 1, startDistance = 0;
let dragStartX = 0, dragStartY = 0;
let isPinching = false, isDraggingImage = false;

// Swipe
let touchStartX = 0, touchEndX = 0;
let isSwiping = false;

// Lightbox state
let lightboxOpen = false;

document.addEventListener("DOMContentLoaded", () => {

  thumbs = Array.from(document.querySelectorAll(".thumb"));
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(thumb);
    });
  });

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

  function resetZoom() {
    scale = 1; translateX = 0; translateY = 0;
    const img = mediaContainer.querySelector("img");
    if (img) img.style.transform = `translate(0px,0px) scale(1)`;
  }

  function updateTransform() {
    const img = mediaContainer.querySelector("img");
    if (!img) return;
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
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
  document.addEventListener("keydown", e => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    else if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

// ------------------ Pinch & Drag Touch Handler ------------------
const img = mediaContainer.querySelector("img");
if (!img) return;
img.style.touchAction = "none";       // disable default gestures
img.style.willChange = "transform";   // GPU optimization

let lastScale = 1;
let lastX = 0;
let lastY = 0;
let originX = 0;
let originY = 0;

mediaContainer.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchStartDistance = Math.sqrt(dx*dx + dy*dy);
    startScale = scale;

    // midpoint
    originX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    originY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    img.style.transformOrigin = `${originX}px ${originY}px`;
  } else if (e.touches.length === 1 && scale > 1) {
    isDraggingImage = true;
    dragStartX = e.touches[0].clientX - translateX;
    dragStartY = e.touches[0].clientY - translateY;
  }
}, { passive: false });

mediaContainer.addEventListener("touchmove", (e) => {
  const img = mediaContainer.querySelector("img");
  if (!img) return;
  e.preventDefault(); // important to stop default zoom

  if (isPinching && e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx*dx + dy*dy);

    let newScale = startScale * (distance / pinchStartDistance);

    // Smooth interpolation
    scale += (newScale - scale) * 0.2; 
    scale = Math.max(1, Math.min(scale, 4));

    updateTransform(img);
  } else if (isDraggingImage && scale > 1) {
    translateX = e.touches[0].clientX - dragStartX;
    translateY = e.touches[0].clientY - dragStartY;
    updateTransform(img);
  }
}, { passive: false });

mediaContainer.addEventListener("touchend", (e) => {
  isPinching = false;
  isDraggingImage = false;

  // Snap final scale gently
  scale = Math.max(1, Math.min(scale, 4));
});
    
