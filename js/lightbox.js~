// lightbox.js

let thumbs = [];
let currentIndex = -1;

// Automatically inject the lightbox div once per page
document.addEventListener("DOMContentLoaded", () => {
  // Populate thumbs array
  thumbs = Array.from(document.querySelectorAll(".thumb"));

  // Insert lightbox HTML if it doesn't exist
  if (!document.getElementById("lightbox")) {
    const lightboxHTML = `
      <div id="lightbox" onclick="closeLightbox()">
        <div class="lightbox-content" onclick="event.stopPropagation()">
          <div id="lightbox-media"></div>
          <div id="lightbox-caption"></div>
          <div id="lightbox-meta"></div>
        </div>
        <div class="esc-hint">Esc → close</div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", lightboxHTML);
  }
});

// Open lightbox for a clicked thumbnail
function openLightbox(thumb) {
  const lightbox = document.getElementById("lightbox");
  const mediaContainer = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const meta = document.getElementById("lightbox-meta");

  mediaContainer.innerHTML = "";

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

  caption.textContent = thumb.closest(".gallery-item")
    .querySelector(".caption")?.textContent || "";

  meta.textContent = [
    thumb.dataset.camera,
    thumb.dataset.lens,
    thumb.dataset.focal,
    thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
    thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
    thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
    thumb.dataset.note ? `${thumb.dataset.note}` : ""
  ].filter(Boolean).join(" • ");

  // Update current index for navigation
  currentIndex = thumbs.indexOf(thumb);

  lightbox.classList.add("show");
}

// Close lightbox
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const mediaContainer = document.getElementById("lightbox-media");
  mediaContainer.innerHTML = "";
  lightbox.classList.remove("show");
}

// Navigate by index
function showImage(index) {
  if (thumbs.length === 0) return;
  if (index < 0) index = thumbs.length - 1;
  if (index >= thumbs.length) index = 0;
  openLightbox(thumbs[index]);
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox.classList.contains("show")) return;

  if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  if (e.key === "ArrowRight") showImage(currentIndex + 1);
  if (e.key === "Escape") closeLightbox();
});

