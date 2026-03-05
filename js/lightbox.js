// lightbox.js
let thumbs = [];
let currentIndex = -1;

document.addEventListener("DOMContentLoaded", () => {

  thumbs = Array.from(document.querySelectorAll(".thumb"));

  // attach click handler automatically
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  // create lightbox if not present
  if (!document.getElementById("lightbox")) {
    const html = `
      <div id="lightbox">
        <div class="lightbox-content">
          <div id="lightbox-media"></div>
          <div id="lightbox-caption"></div>
          <div id="lightbox-meta"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);

    document.getElementById("lightbox").addEventListener("click", closeLightbox);
  }

});

function openLightbox(index) {

  currentIndex = index;
  const thumb = thumbs[index];

  const lightbox = document.getElementById("lightbox");
  const mediaContainer = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const meta = document.getElementById("lightbox-meta");

  mediaContainer.innerHTML = "";

  const img = document.createElement("img");
  img.src = thumb.src;
  mediaContainer.appendChild(img);

  caption.textContent =
    thumb.closest(".gallery-item")
      ?.querySelector(".caption")
      ?.textContent || "";

  meta.textContent = [
    thumb.dataset.camera,
    thumb.dataset.lens,
    thumb.dataset.focal,
    thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
    thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
    thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : ""
  ].filter(Boolean).join(" • ");

  lightbox.classList.add("show");
}


// Close lightbox
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const mediaContainer = document.getElementById("lightbox-media");
  mediaContainer.innerHTML = "";
  lightbox.classList.remove("show");
}

function showImage(index) {

  const lightbox = document.getElementById("lightbox");
  const mediaContainer = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const meta = document.getElementById("lightbox-meta");

  if (thumbs.length === 0) return;

  if (index < 0) index = thumbs.length - 1;
  if (index >= thumbs.length) index = 0;

  const thumb = thumbs[index];
  currentIndex = index;

  mediaContainer.innerHTML = "";

  const img = document.createElement("img");
  img.src = thumb.src;
  mediaContainer.appendChild(img);

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

  lightbox.classList.add("show");
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox.classList.contains("show")) return;

  if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  if (e.key === "ArrowRight") showImage(currentIndex + 1);
  if (e.key === "Escape") closeLightbox();
});

