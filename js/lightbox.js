// minimal working lightbox

function openLightbox(thumb) {
  // make sure the container exists
  let lightbox = document.getElementById("lightbox");
  if (!lightbox) {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="lightbox" onclick="closeLightbox()">
        <div class="lightbox-content" onclick="event.stopPropagation()">
          <div id="lightbox-media"></div>
          <div id="lightbox-caption"></div>
          <div id="lightbox-meta"></div>
        </div>
      </div>
    `);
    lightbox = document.getElementById("lightbox");
  }

  const media = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const meta = document.getElementById("lightbox-meta");

  media.innerHTML = ""; // clear previous
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

  lightbox.classList.add("show");
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  document.getElementById("lightbox-media").innerHTML = "";
  lightbox.classList.remove("show");
}

// Arrow keys + Esc
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox || !lightbox.classList.contains("show")) return;

  if (e.key === "Escape") closeLightbox();
});
