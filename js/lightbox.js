// SINGLE GLOBAL VARIABLES
let thumbs = [];
let currentIndex = -1;

// Initialize after DOM ready
document.addEventListener("DOMContentLoaded", () => {
    thumbs = Array.from(document.querySelectorAll(".thumb"));

    thumbs.forEach(thumb => {
        thumb.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openLightbox(thumb);
        });
    });

    // Inject lightbox if missing
    if (!document.getElementById("lightbox")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div id="lightbox">
                <div class="lightbox-content">
                    <div id="lightbox-media"></div>
                    <div id="lightbox-caption"></div>
                    <div id="lightbox-meta"></div>
                </div>
                <div class="esc-hint">Esc → close</div>
            </div>
        `);
    }

    const lightbox = document.getElementById("lightbox");

    // --- SINGLE KEYDOWN LISTENER ---
    window.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("show")) return; // check DOM directly
        if (e.repeat) return;

        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") showImage(currentIndex - 1);
        else if (e.key === "ArrowRight") showImage(currentIndex + 1);
    });
});

// --- OPEN / CLOSE LOGIC ---
function openLightbox(thumb) {
    const mediaContainer = document.getElementById("lightbox-media");
    const caption = document.getElementById("lightbox-caption");
    const meta = document.getElementById("lightbox-meta");
    const lightbox = document.getElementById("lightbox");

    currentIndex = thumbs.indexOf(thumb);
    if (currentIndex === -1) return;

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
        mediaContainer.appendChild(img);
    }

    caption.textContent = thumb.closest(".gallery-item")?.querySelector(".caption")?.textContent || "";
    meta.textContent = [
        thumb.dataset.camera, thumb.dataset.lens, thumb.dataset.focal,
        thumb.dataset.aperture ? `ƒ/${thumb.dataset.aperture}` : "",
        thumb.dataset.shutter ? `${thumb.dataset.shutter} s` : "",
        thumb.dataset.iso ? `ISO ${thumb.dataset.iso}` : "",
        thumb.dataset.note ? `${thumb.dataset.note}` : ""
    ].filter(Boolean).join(" • ");

    lightbox.classList.add("show");
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const mediaContainer = document.getElementById("lightbox-media");
    mediaContainer.innerHTML = "";
    lightbox.classList.remove("show");
}

// --- IMAGE NAVIGATION ---
function showImage(index) {
    if (thumbs.length === 0) return;
    const newIndex = (index + thumbs.length) % thumbs.length;
    openLightbox(thumbs[newIndex]);
    currentIndex = newIndex;
}
