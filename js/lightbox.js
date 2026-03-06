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

  const oldVideo = media.querySelector("video");
  if (oldVideo) {
    oldVideo.pause();
    oldVideo.currentTime = 0;
  }

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

  const video = media.querySelector("video");
  if (video) {
    video.pause();
    video.currentTime = 0;
  }

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


// -----------------------------
// Swipe navigation (mobile)
// -----------------------------

let touchStartX = 0;
let touchEndX = 0;

const swipeThreshold = 50; // minimum pixels to count as swipe

const lightbox = document.getElementById("lightbox");

lightbox.addEventListener("touchstart", function(e) {

  if (!lightbox.classList.contains("show")) return;

  touchStartX = e.changedTouches[0].screenX;

}, { passive: true });

lightbox.addEventListener("touchend", function(e) {

  if (!lightbox.classList.contains("show")) return;

  touchEndX = e.changedTouches[0].screenX;

  const delta = touchEndX - touchStartX;

  if (Math.abs(delta) < swipeThreshold) return;

  if (delta < 0) {
    nextImage();   // swipe left → next image
  } else {
    prevImage();   // swipe right → previous image
  }

}, { passive: true });
