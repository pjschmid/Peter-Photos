let thumbs = [];
let currentIndex = -1;

document.addEventListener("DOMContentLoaded", function () {

  thumbs = Array.from(document.querySelectorAll(".thumb"));

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => openLightbox(index));
  });

  document.getElementById("lightbox").addEventListener("click", closeLightbox);
    
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

  const cap = thumb.closest(".gallery-item")
      .querySelector(".caption");

  caption.textContent = cap ? cap.textContent : "";

  meta.textContent = [
    thumb.dataset.camera,
    thumb.dataset.lens,
    thumb.dataset.focal,
    thumb.dataset.aperture ? "ƒ/" + thumb.dataset.aperture : "",
    thumb.dataset.shutter,
    thumb.dataset.iso ? "ISO " + thumb.dataset.iso : "",
    thumb.dataset.note
  ].filter(Boolean).join(" • ");

  lightbox.classList.add("show");
}

function closeLightbox() {

  const lightbox = document.getElementById("lightbox");
  const media = document.getElementById("lightbox-media");

  media.innerHTML = "";
  lightbox.classList.remove("show");

}

function nextImage() {
  currentIndex++;
  if (currentIndex >= thumbs.length) currentIndex = 0;
  openLightbox(currentIndex);
}

function prevImage() {
  currentIndex--;
  if (currentIndex < 0) currentIndex = thumbs.length - 1;
  openLightbox(currentIndex);
}

document.addEventListener("keydown", function (e) {

  const lightbox = document.getElementById("lightbox");
  if (!lightbox.classList.contains("show")) return;

  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
  if (e.key === "Escape") closeLightbox();

});


