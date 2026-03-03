// ===============================
// LIGHTBOX.JS - Desktop Version
// ===============================

let thumbs = [];
let currentIndex = -1;
let lightboxOpen = false;

// -----------------------------
// Initialize gallery
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  thumbs = Array.from(document.querySelectorAll(".thumb"));

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(thumb);
    });
  });

  // Inject lightbox HTML if missing
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

  // Attach key listener
  window.addEventListener("keydown", (e) => {
    if (!lightboxOpen) return;

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
});

// -----------------------------
// Open / Close Lightbox
// -----------------------------
function openLightbox(thumb) {
  const index = thumbs.indexOf(thumb);
  if (index !== -1) showImage(index);
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const mediaContainer = document.getElementById("lightbox-media");

  mediaContainer.innerHTML = "";
  lightbox.classList.remove("show");
  lightboxOpen = false;
}

// -----------------------------
// Show Image by index
// -----------------------------
function showImage(index) {
  if (thumbs.length === 0) return;

  const lightbox = document.getElementById("lightbox");
  const mediaContainer = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const meta = document.getElementById("lightbox-meta");

  currentIndex = (index + thumbs.length) % thumbs.length;

  mediaContainer.innerHTML = "";
  const thumb = thumbs[currentIndex];

  if (thumb.dataset.type === "video") {
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

  caption.textContent =
    thumb.closest(".gallery-item").querySelector(".caption")?.textContent || "";

  meta.textContent = [
    thumb.dataset.camera,
    thumb.dataset.lens,
    thumb.dataset.focal,
    thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
    thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
    thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
    thumb.dataset.note ? `${thumb.dataset.note}` : "",
  ].filter(Boolean).join(" • ");

  lightbox.classList.add("show");
  lightboxOpen = true;
}
