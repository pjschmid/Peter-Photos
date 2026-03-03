let thumbnails = [];
let currentIndex = -1;

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeBtn = document.getElementById("lightbox-close");

// ----------------------------------
// Open
// ----------------------------------
function openLightbox(imgElement) {
  thumbnails = Array.from(document.querySelectorAll(".thumb"));
  currentIndex = thumbnails.indexOf(imgElement);

  showImage(currentIndex);
  lightbox.classList.add("show");
}

// ----------------------------------
// Show image by index
// ----------------------------------
function showImage(index) {
  if (thumbnails.length === 0) return;

  currentIndex = (index + thumbnails.length) % thumbnails.length;
  lightboxImage.src = thumbnails[currentIndex].src;
}

// ----------------------------------
// Close
// ----------------------------------
function closeLightbox() {
  lightbox.classList.remove("show");
}

// ----------------------------------
// Keyboard navigation
// ----------------------------------
document.addEventListener("keydown", function (e) {
  if (!lightbox.classList.contains("show")) return;

  if (e.key === "Escape") {
    closeLightbox();
  } 
  else if (e.key === "ArrowLeft") {
    showImage(currentIndex - 1);
  } 
  else if (e.key === "ArrowRight") {
    showImage(currentIndex + 1);
  }
});

// ----------------------------------
// Close button
// ----------------------------------
closeBtn.addEventListener("click", closeLightbox);

// ----------------------------------
// Click outside image closes
// ----------------------------------
lightbox.addEventListener("click", function (e) {
  if (e.target === lightbox) {
    closeLightbox();
  }
});
