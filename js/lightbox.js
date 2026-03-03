// ============================
// MINIMAL WORKING LIGHTBOX
// ============================

let thumbs = [];
let currentIndex = -1;

document.addEventListener("DOMContentLoaded", () => {

  // Find all thumbnails
  thumbs = Array.from(document.querySelectorAll(".thumb"));

  // Add click handlers
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(index);
    });
  });

  // Inject lightbox HTML if missing
  if (!document.getElementById("lightbox")) {
    const html = `
      <div id="lightbox" style="display:none;">
        <div class="lightbox-content">
          <div id="lightbox-media"></div>
          <div id="lightbox-caption"></div>
          <div id="lightbox-meta"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  const lightbox = document.getElementById("lightbox");

  // Close lightbox on click outside content
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display !== "block") return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });
});

function openLightbox(index) {
  showImage(index);
  document.getElementById("lightbox").style.display = "block";
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
  document.getElementById("lightbox-media").innerHTML = "";
}

function showImage(index) {
  if (thumbs.length === 0) return;

  currentIndex = (index + thumbs.length) % thumbs.length;
  const thumb = thumbs[currentIndex];

  const container = document.getElementById("lightbox-media");
  container.innerHTML = "";

  const type = thumb.dataset.type || "image";

  if (type === "video") {
    const video = document.createElement("video");
    video.src = thumb.dataset.video;
    video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    container.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = thumb.src;
    container.appendChild(img);
  }

  // Caption
  document.getElementById("lightbox-caption").textContent =
    thumb.closest(".gallery-item").querySelector(".caption")?.textContent || "";

  // Meta
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
}
