document.addEventListener("DOMContentLoaded", () => {
  const thumbs = Array.from(document.querySelectorAll(".thumb"));
  let currentIndex = 0;
  let lightboxOpen = false;

  let scale = 1, translateX = 0, translateY = 0;
  let isPinching = false, isDraggingImage = false, dragStartX = 0, dragStartY = 0;
  let startDistance = 0, startScale = 1;

  let touchStartX = 0, touchEndX = 0, isSwiping = false;

  let lightbox = document.getElementById("lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <div id="lightbox-media"></div>
        <div id="lightbox-caption"></div>
        <div id="lightbox-meta"></div>
      </div>
      <div class="esc-hint">Esc → close</div>
    `;
    document.body.appendChild(lightbox);
  }

  const content = lightbox.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");

  function resetZoom() {
    scale = 1; translateX = 0; translateY = 0;
    const img = mediaContainer.querySelector("img");
    if (img) img.style.transform = `translate(0px,0px) scale(1)`;
  }

  function updateTransform() {
    const img = mediaContainer.querySelector("img");
    if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function showImage(index) {
    if (thumbs.length === 0) return;
    currentIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[currentIndex];

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
      img.style.transition = "transform 0.2s ease";
      mediaContainer.appendChild(img);
    }

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

    resetZoom();
    lightbox.classList.add("show");
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightboxOpen = false;
    mediaContainer.innerHTML = "";
    lightbox.classList.remove("show");
    resetZoom();
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => showImage(i));
  });

  document.addEventListener("keydown", (e) => {
    if (!lightboxOpen) return;
    if (e.repeat) return;

    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    else if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // ----- Touch events -----
  lightbox.addEventListener("touchstart", (e) => {
    if (!lightboxOpen) return;
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (e.touches.length === 2) {
      isPinching = true;
      startDistance = getDistance(e.touches);
      startScale = scale;
      return;
    }

    if (scale > 1) {
      isDraggingImage = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
      return;
    }

    touchStartX = e.touches[0].screenX;
    isSwiping = true;
    content.style.transition = "none";
  }, { passive: true });

  lightbox.addEventListener("touchmove", (e) => {
    const img = mediaContainer.querySelector("img");
    if (!img) return;

    if (isPinching && e.touches.length === 2) {
      const newDistance = getDistance(e.touches);
      scale = Math.min(Math.max(startScale * (newDistance / startDistance), 1), 4);
      updateTransform();
      return;
    }

    if (isDraggingImage && scale > 1) {
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      updateTransform();
      return;
    }

    if (isSwiping && scale === 1) {
      touchEndX = e.touches[0].screenX;
      const deltaX = touchEndX - touchStartX;
      content.style.transform = `translateX(${deltaX}px)`;
    }
  }, { passive: true });

  lightbox.addEventListener("touchend", () => {
    if (isPinching) { isPinching = false; return; }
    if (isDraggingImage) { isDraggingImage = false; return; }

    if (isSwiping) {
      const deltaX = touchEndX - touchStartX;
      const threshold = 50;
      content.style.transition = "transform 0.25s ease";

      if (deltaX < -threshold) {
        content.style.transform = "translateX(-100%)";
        setTimeout(() => showImage(currentIndex + 1), 250);
      } else if (deltaX > threshold) {
        content.style.transform = "translateX(100%)";
        setTimeout(() => showImage(currentIndex - 1), 250);
      } else {
        content.style.transform = "translateX(0)";
      }

      isSwiping = false;
    }
  }, { passive: true });

});
