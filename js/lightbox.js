let thumbs = [];
let currentIndex = -1;
let lightboxOpen = false;

// Touch/zoom state
let scale = 1, translateX = 0, translateY = 0;
let startScale = 1, startDistance = 0;
let dragStartX = 0, dragStartY = 0;
let isDragging = false;
let isPinching = false;

// Swipe state
let swipeStartX = 0, swipeDeltaX = 0;
let isSwiping = false;

document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const content = document.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");

  thumbs = Array.from(document.querySelectorAll(".thumb"));

  // ====================
  // Open / Close Lightbox
  // ====================
  window.openLightbox = (thumb) => {
    const index = thumbs.indexOf(thumb);
    if (index !== -1) showImage(index);
  };

  const closeLightbox = () => {
    lightboxOpen = false;
    mediaContainer.innerHTML = "";
    lightbox.classList.remove("show");
    resetTransform();
  };

  // ====================
  // Show Image / Video
  // ====================
  const showImage = (index) => {
    if (thumbs.length === 0) return;
    currentIndex = (index + thumbs.length) % thumbs.length;

    mediaContainer.innerHTML = "";
    const thumb = thumbs[currentIndex];
    const type = thumb.dataset.type || "image";

    let media;
    if (type === "video") {
      media = document.createElement("video");
      media.src = thumb.dataset.video || thumb.src;
      media.controls = true;
      media.autoplay = true;
      media.loop = true;
      media.playsInline = true;
    } else {
      media = document.createElement("img");
      media.src = thumb.src;
    }
    mediaContainer.appendChild(media);

    document.getElementById("lightbox-caption").textContent =
      thumb.closest(".gallery-item").querySelector(".caption")?.textContent || "";

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

    resetTransform();
    lightboxOpen = true;
    lightbox.classList.add("show");
  };

  const resetTransform = () => {
    scale = 1; translateX = 0; translateY = 0;
    const img = mediaContainer.querySelector("img, video");
    if (img) img.style.transform = "translate(0px,0px) scale(1)";
  };

  // ====================
  // Keyboard
  // ====================
  document.addEventListener("keydown", (e) => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

  // ====================
  // Pointer Events (swipe + pinch + drag)
  // ====================
  content.addEventListener("pointerdown", (e) => {
    if (!lightboxOpen) return;
    content.setPointerCapture(e.pointerId);

    const img = mediaContainer.querySelector("img, video");
    if (!img) return;

    if (e.pointerType === "touch") {
      if (e.isPrimary && e.pointerId && e.width > 0) {
        // single touch -> swipe or drag
        swipeStartX = e.clientX;
        isSwiping = scale === 1;
        if (scale > 1) {
          isDragging = true;
          dragStartX = e.clientX - translateX;
          dragStartY = e.clientY - translateY;
        }
      }
    }
  });

  content.addEventListener("pointermove", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img, video");
    if (!img) return;

    if (e.pointerType === "touch") {
      if (isDragging) {
        translateX = e.clientX - dragStartX;
        translateY = e.clientY - dragStartY;
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      } else if (isSwiping) {
        swipeDeltaX = e.clientX - swipeStartX;
        content.style.transition = "none";
        content.style.transform = `translateX(${swipeDeltaX}px)`;
      }
    }
  });

  content.addEventListener("pointerup", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img, video");
    if (!img) return;

    if (isDragging) { isDragging = false; return; }

    if (isSwiping) {
      const threshold = 70;
      content.style.transition = "transform 0.3s ease";

      if (swipeDeltaX < -threshold) {
        content.style.transform = "translateX(-100%)";
        setTimeout(() => showImage(currentIndex + 1), 250);
      } else if (swipeDeltaX > threshold) {
        content.style.transform = "translateX(100%)";
        setTimeout(() => showImage(currentIndex - 1), 250);
      } else {
        content.style.transform = "translateX(0)";
      }
      swipeDeltaX = 0;
      isSwiping = false;
    }
  });

  // Pinch zoom (2-finger)
  let pointers = {};
  content.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") pointers[e.pointerId] = e;
    if (Object.keys(pointers).length === 2) {
      const ids = Object.keys(pointers);
      const a = pointers[ids[0]], b = pointers[ids[1]];
      startDistance = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      startScale = scale;
      isPinching = true;
    }
  });

  content.addEventListener("pointermove", (e) => {
    if (!isPinching) return;
    if (pointers[e.pointerId]) pointers[e.pointerId] = e;
    const ids = Object.keys(pointers);
    if (ids.length === 2) {
      const a = pointers[ids[0]], b = pointers[ids[1]];
      const currentDistance = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      scale = Math.min(Math.max(startScale * (currentDistance/startDistance), 1), 4);
      const img = mediaContainer.querySelector("img, video");
      if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
  });

  content.addEventListener("pointerup", (e) => {
    delete pointers[e.pointerId];
    if (Object.keys(pointers).length < 2) isPinching = false;
  });
});
