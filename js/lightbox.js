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


// IPAD PART

lightbox.addEventListener("touchstart", (e) => {
  if (!lightboxOpen) return;

  const img = mediaContainer.querySelector("img");
  if (!img) return;

  if (e.touches.length === 2) {
    // Pinch start
    isPinching = true;
    startDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    startScale = scale;
  } else if (scale > 1 && e.touches.length === 1) {
    // Drag image
    isDraggingImage = true;
    dragStartX = e.touches[0].clientX - translateX;
    dragStartY = e.touches[0].clientY - translateY;
  } else if (scale === 1 && e.touches.length === 1) {
    // Swipe
    isSwiping = true;
    touchStartX = e.touches[0].clientX;
    content.style.transition = "none";
  }
});

lightbox.addEventListener("touchmove", (e) => {
  const img = mediaContainer.querySelector("img");
  if (!img) return;

  if (isPinching && e.touches.length === 2) {
    const newDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    scale = Math.min(Math.max(startScale * (newDistance / startDistance), 1), 4);
    img.style.transform = `translate3d(${translateX}px,${translateY}px,0) scale(${scale})`;
  } else if (isDraggingImage) {
    translateX = e.touches[0].clientX - dragStartX;
    translateY = e.touches[0].clientY - dragStartY;
    img.style.transform = `translate3d(${translateX}px,${translateY}px,0) scale(${scale})`;
  } else if (isSwiping) {
    const deltaX = e.touches[0].clientX - touchStartX;
    content.style.transform = `translate3d(${deltaX}px,0,0)`;
  }
});

lightbox.addEventListener("touchend", (e) => {
  if (isPinching) { isPinching = false; return; }
  if (isDraggingImage) { isDraggingImage = false; return; }

  if (isSwiping) {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 70;
    content.style.transition = "transform 0.3s ease";

    if (deltaX < -threshold) showImage(currentIndex + 1);
    else if (deltaX > threshold) showImage(currentIndex - 1);
    else content.style.transform = "translate3d(0,0,0)";

    isSwiping = false;
  }
});
