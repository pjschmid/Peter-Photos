// ===============================
// Minimal Lightbox v1.0
// Works on Desktop + iPad
// ===============================

let thumbs = [];
let currentIndex = -1;

// Zoom & drag
let scale = 1, startScale = 1;
let translateX = 0, translateY = 0;
let startX = 0, startY = 0;
let isDragging = false;
let isPinching = false;
let pinchStartDistance = 0;

// Swipe
let swipeStartX = 0;
let isSwiping = false;

const lightbox = document.getElementById("lightbox");
const content = lightbox.querySelector(".lightbox-content");
const mediaContainer = document.getElementById("lightbox-media");
const captionEl = document.getElementById("lightbox-caption");
const metaEl = document.getElementById("lightbox-meta");

// -------------------------
// Open / Close
// -------------------------
function openLightbox(thumb) {
  thumbs = Array.from(document.querySelectorAll(".thumb"));
  currentIndex = thumbs.indexOf(thumb);
  showImage(currentIndex);
  lightbox.classList.add("show");
}

function closeLightbox() {
  lightbox.classList.remove("show");
  mediaContainer.innerHTML = "";
  resetZoom();
}

// -------------------------
// Show Image / Video
// -------------------------
function showImage(index) {
  if (thumbs.length === 0) return;
  currentIndex = (index + thumbs.length) % thumbs.length;
  const thumb = thumbs[currentIndex];

  mediaContainer.innerHTML = "";

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
    img.style.transition = "transform 0.05s ease-out";
    mediaContainer.appendChild(img);
  }

  captionEl.textContent =
    thumb.closest(".gallery-item").querySelector(".caption")?.textContent || "";

  metaEl.textContent =
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
}

// -------------------------
// Zoom / Drag
// -------------------------
function resetZoom() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  const img = mediaContainer.querySelector("img");
  if (img) img.style.transform = `translate(0px,0px) scale(1)`;
}

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx*dx + dy*dy);
}

function updateTransform() {
  const img = mediaContainer.querySelector("img");
  if (img) {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
}

// -------------------------
// Keyboard (desktop)
// -------------------------
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("show")) return;
  if (e.repeat) return;

  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  else if (e.key === "ArrowRight") showImage(currentIndex + 1);
});

// -------------------------
// Pointer events (touch + iPad)
// -------------------------
content.addEventListener("pointerdown", (e) => {
  const img = mediaContainer.querySelector("img");
  if (!img) return;

  if (e.pointerType === "touch") {
    if (e.isPrimary) {
      swipeStartX = e.clientX;
      isSwiping = scale === 1;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      isDragging = scale > 1;
    }
  }
});

content.addEventListener("pointermove", (e) => {
  const img = mediaContainer.querySelector("img");
  if (!img) return;

  if (e.pointerType === "touch") {
    if (isDragging) {
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    } else if (isSwiping) {
      const deltaX = e.clientX - swipeStartX;
      content.style.transform = `translateX(${deltaX}px)`;
    }
  }
});

content.addEventListener("pointerup", (e) => {
  if (isSwiping) {
    const deltaX = e.clientX - swipeStartX;
    const threshold = 50;
    content.style.transition = "transform 0.3s ease";
    if (deltaX > threshold) showImage(currentIndex - 1);
    else if (deltaX < -threshold) showImage(currentIndex + 1);
    content.style.transform = `translateX(0px)`;
    isSwiping = false;
  }
  isDragging = false;
});

// -------------------------
// Pinch-to-zoom (two fingers)
// -------------------------
let activeTouches = [];

content.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    pinchStartDistance = getDistance(e.touches);
    startScale = scale;
  }
});

content.addEventListener("touchmove", (e) => {
  const img = mediaContainer.querySelector("img");
  if (!img) return;

  if (isPinching && e.touches.length === 2) {
    const dist = getDistance(e.touches);
    scale = Math.min(Math.max(startScale * (dist / pinchStartDistance), 1), 4);
    updateTransform();
  }
});

content.addEventListener("touchend", (e) => {
  if (e.touches.length < 2) isPinching = false;
});
