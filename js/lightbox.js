let thumbs = [];
let currentIndex = -1;

document.addEventListener("DOMContentLoaded", () => {

  thumbs = Array.from(document.querySelectorAll(".thumb"));

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => openLightbox(index));
  });

  const lightbox = document.getElementById("lightbox");

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

});


function openLightbox(index) {

  currentIndex = index;

  const thumb = thumbs[index];

  const lightbox = document.getElementById("lightbox");
  const media = document.getElementById("lightbox-media");
  const caption = document.getElementById("lightbox-caption");
  const meta = document.getElementById("lightbox-meta");

  media.innerHTML = "";

  const img = document.createElement("img");
  img.src = thumb.src;

  media.appendChild(img);

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


function closeLightbox() {

  const lightbox = document.getElementById("lightbox");
  const media = document.getElementById("lightbox-media");

  media.innerHTML = "";
  lightbox.classList.remove("show");

}


function showImage(index) {

  if (index < 0) index = thumbs.length - 1;
  if (index >= thumbs.length) index = 0;

  openLightbox(index);

}


document.addEventListener("keydown", (e) => {

  const lightbox = document.getElementById("lightbox");

  if (!lightbox.classList.contains("show")) return;

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    showImage(currentIndex - 1);
  }

  if (e.key === "ArrowRight") {
    e.preventDefault();
    showImage(currentIndex + 1);
  }

  if (e.key === "Escape") {
    closeLightbox();
  }

});
