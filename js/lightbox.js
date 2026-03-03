// ------------------------------
// SIMPLE LIGHTBOX
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const thumbs = Array.from(document.querySelectorAll(".thumb"));
  const body = document.body;

  // Create lightbox once
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
    body.appendChild(lightbox);
  }

  const content = lightbox.querySelector(".lightbox-content");
  const mediaContainer = document.getElementById("lightbox-media");
  let currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[currentIndex];

    mediaContainer.innerHTML = "";
    const img = document.createElement("img");
    img.src = thumb.src;
    mediaContainer.appendChild(img);

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

    lightbox.classList.add("show");
  }

  function closeLightbox() {
    lightbox.classList.remove("show");
    mediaContainer.innerHTML = "";
  }

  // Click thumbnails
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => showImage(i));
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;

    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    else if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

  // Close on background click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
});
