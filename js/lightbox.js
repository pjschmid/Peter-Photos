 let thumbs = [];
let currentIndex = -1;

// Inject lightbox container
document.addEventListener("DOMContentLoaded", () => {
  thumbs = Array.from(document.querySelectorAll(".thumb"));

  // Insert lightbox if missing
  if (!document.getElementById("lightbox")) {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="lightbox">
        <div class="lightbox-content" onclick="event.stopPropagation()">
          <div id="lightbox-media"></div>
          <div id="lightbox-caption"></div>
          <div id="lightbox-meta"></div>
        </div>
        <div class="esc-hint">Esc → close</div>
      </div>
    `);
  }
});

// Open lightbox
function openLightbox(thumb) {
  const lightbox = document.getElementById("lightbox");
  const media = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const meta = document.getElementById("lightbox-meta");

  media.innerHTML = "";
  const type = thumb.dataset.type || "image";

  if (type === "video") {
    const video = document.createElement("video");
    video.src = thumb.dataset.video;
    video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    media.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = thumb.src;
    media.appendChild(img);
  }

  caption.textContent = thumb.closest(".gallery-item").querySelector(".caption")?.textContent || "";
  meta.textContent = [
    thumb.dataset.camera,
    thumb.dataset.lens,
    thumb.dataset.focal,
    thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
    thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
    thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
    thumb.dataset.note ? thumb.dataset.note : ""
  ].filter(Boolean).join(" • ");

  currentIndex = thumbs.indexOf(thumb);
  lightbox.classList.add("show");
}

// Close lightbox
function closeLightbox() {
  document.getElementById("lightbox-media").innerHTML = "";
  document.getElementById("lightbox").classList.remove("show");
}

// Arrow keys + Esc
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox.classList.contains("show")) return;
  if (e.repeat) return;

  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  else if (e.key === "ArrowRight") showImage(currentIndex + 1);
});

function showImage(index) {
  if (thumbs.length === 0) return;
  if (index < 0) index = thumbs.length - 1;
  if (index >= thumbs.length) index = 0;
  openLightbox(thumbs[index]);
}
