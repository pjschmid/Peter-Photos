let thumbs = [];
let currentIndex = -1;

document.addEventListener("DOMContentLoaded", function () {

  thumbs = Array.from(document.querySelectorAll(".thumb"));

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => openLightbox(index));
  });

  const lightbox = document.getElementById("lightbox");

  const media = document.getElementById("lightbox-media");

media.addEventListener("mousemove", function(e) {

  const img = media.querySelector("img");
  if (!img) return;

  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;

  if (x < rect.width / 2) {
    img.style.cursor = "w-resize";
  } else {
    img.style.cursor = "e-resize";
  }

});

  lightbox.addEventListener("click", function(e) {

  const media = document.getElementById("lightbox-media");

  // if clicking outside the image/video → close
  if (!media.contains(e.target)) {
    closeLightbox();
    return;
  }

  // navigation only for images
  const rect = media.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  if (clickX < rect.width / 2) {
    prevImage();
  } else {
    nextImage();
  }

});
    

  // Swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;

  lightbox.addEventListener("touchstart", function(e) {
    if (!lightbox.classList.contains("show")) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", function(e) {
    if (!lightbox.classList.contains("show")) return;

    touchEndX = e.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;

    if (Math.abs(delta) < swipeThreshold) return;

    if (delta < 0) nextImage();
    else prevImage();

  }, { passive: true });

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

    let img = media.querySelector("img");
    let video = media.querySelector("video");

    const type = thumb.dataset.type || "image";

    if (type === "video") {

	// remove existing image when switching to video
	if (img) {
	    img.remove();
	    img = null;
	}

	// reuse existing video if possible
	if (!video) {
	    video = document.createElement("video");
	    media.appendChild(video);
	}

	video.src = thumb.dataset.video;
	video.controls = true;
	video.autoplay = true;
	video.loop = true;
	video.playsInline = true;

    } else {


	if (video) media.innerHTML = "";   // remove video if switching
	
	if (!img) {
	    img = document.createElement("img");
	    media.appendChild(img);
	}
	    
	img.src = thumb.src;
	
	img.classList.add("lb-blur");
	
	const full = thumb.dataset.full;
	
	if (full) {
	    
	    const hiRes = new Image();
	    hiRes.src = full;
	    
	    hiRes.onload = () => {
		img.src = full;
		img.classList.remove("lb-blur");
	    };
	    
	} else {
	    img.classList.remove("lb-blur");
	}
    }    
      

  const cap = thumb.closest(".gallery-item")
    .querySelector(".caption");

  caption.textContent = cap ? cap.textContent : "";

  meta.textContent = [
    thumb.dataset.camera,
    thumb.dataset.lens,
    thumb.dataset.focal,
    thumb.dataset.aperture ? "ƒ/" + thumb.dataset.aperture : "",
    thumb.dataset.shutter ? thumb.dataset.shutter + "s" : "",
    thumb.dataset.iso ? "ISO " + thumb.dataset.iso : "",
    thumb.dataset.note
  ].filter(Boolean).join(" • ");

  lightbox.classList.add("show");

  preloadNeighbors(index);

  if (!window.swipeHintShown) {
    const hint = document.getElementById("swipe-hint");
    if (hint) {
      hint.classList.add("show");

      setTimeout(() => {
        hint.classList.remove("show");
      }, 2000);
    }

    window.swipeHintShown = true;
  }

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


function preloadNeighbors(index) {

  const next = (index + 1) % thumbs.length;
  const prev = (index - 1 + thumbs.length) % thumbs.length;

  [next, prev].forEach(i => {

    const t = thumbs[i];
    const type = t.dataset.type || "image";

    if (type === "image") {

      const src = t.dataset.full || t.src;
      const img = new Image();
      img.src = src;

    }

  });

}
