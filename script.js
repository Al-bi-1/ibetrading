document.addEventListener('DOMContentLoaded', () => {
  console.log("Website Loaded");

  const container = document.getElementById("products-container");

  if (container) {
    fetch("products.json")
      .then(res => res.json())
      .then(products => {
        products.forEach((section, index) => {
          const sec = document.createElement("section");
          sec.className = "product-section";

          const title = document.createElement("h2");
          title.textContent = section.category;
          sec.appendChild(title);

          const grid = document.createElement("div");
          grid.className = "product-grid";

          section.items.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.style.cursor = "pointer";

            const previewImage = product.images.find(src => !src.endsWith(".mp4") && !src.endsWith(".webm")) || product.images[0];
            card.innerHTML = `
              <img src="${previewImage}" alt="${product.name}">
              <h3>${product.name}</h3>
              <p>${product.desc}</p>
              <strong>${product.price}</strong>
            `;

            card.addEventListener("click", () => {
              sessionStorage.setItem("scrollPos", window.scrollY);
              localStorage.setItem("selectedProduct", JSON.stringify(product));
              window.location.href = "product.html";
            });

              grid.appendChild(card);
            });

            sec.appendChild(grid);
            container.appendChild(sec);

            if (index < products.length - 1) {
              container.appendChild(document.createElement("br"));
              container.appendChild(document.createElement("hr"));
              container.appendChild(document.createElement("br"));
            }
        });
            const scrollPos = sessionStorage.getItem("scrollPos");
          if (scrollPos) {
            window.scrollTo(0, parseInt(scrollPos));
            sessionStorage.removeItem("scrollPos");
          }

      });
  }

  /* ===== Gallery + Zoom (replace existing detailContainer block) ===== */
const detailContainer = document.getElementById("product-detail");
if (detailContainer) {
  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  if (product) {
    // Build thumbnails HTML (videos & images)
    const thumbsHtml = product.images.map((src, i) => {
      const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");
      if (isVideo) {
        // small video element as thumbnail (preload metadata so it shows a frame)
        return `<video class="thumb ${i === 0 ? "active" : ""}" data-index="${i}" muted playsinline preload="metadata">
                  <source src="${src}" type="video/mp4">
                </video>`;
      } else {
        return `<img src="${src}" class="thumb ${i === 0 ? "active" : ""}" data-index="${i}" alt="${product.name} thumbnail">`;
      }
    }).join("");

    // initial main media (first item)
    const firstSrc = product.images[0];
    const firstIsVideo = firstSrc.endsWith(".mp4") || firstSrc.endsWith(".webm");
    const mainStartHTML = firstIsVideo
      ? `<video id="mainPlayer" controls autoplay muted playsinline preload="auto" style="max-width:100%; height:auto;">
           <source src="${firstSrc}" type="video/mp4">
         </video>`
      : `<img id="mainPlayer" class="zoomable" src="${firstSrc}" alt="${product.name}" style="max-width:100%; height:auto;">`;

    // write full detail HTML
    const detailHTML = `
      <div class="gallery">
        <div class="thumbnails">
          ${thumbsHtml}
        </div>
        <div class="main-image" id="mainMedia">
          ${mainStartHTML}
        </div>
      </div>
      <p>${product.details}</p>
      <h3>Specifications</h3>
      <table style="margin: 0 auto; border-collapse: collapse;">
        <tbody>
          ${Object.entries(product.specs).map(([key, value]) => 
            `<tr><td style='border: 1px solid #ccc; padding: 0.5rem;'>${key}</td>
                 <td style='border: 1px solid #ccc; padding: 0.5rem;'>${value}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
    detailContainer.innerHTML = detailHTML;

    const thumbs = detailContainer.querySelectorAll(".thumbnails .thumb");
    const mainMedia = detailContainer.querySelector("#mainMedia");

    // Render main media (image or video) and attach zoom if image
    function renderMain(src) {
      const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");
      if (isVideo) {
        // show video player
        mainMedia.innerHTML = `
          <video id="mainPlayer" controls autoplay muted playsinline preload="auto" style="max-width:100%; height:auto;">
            <source src="${src}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        `;
      } else {
        // show image with zoomable class
        mainMedia.innerHTML = `
          <img id="mainPlayer" class="zoomable" src="${src}" alt="${product.name}" style="max-width:100%; height:auto;">
        `;
        enableZoom(); // attach zoom handlers to newly created image
      }
    }

    // Enable cursor-following zoom on the currently rendered main image
    function enableZoom() {
      const img = mainMedia.querySelector(".zoomable");
      if (!img) return;

      // Replace node to clear previous listeners (defensive)
      const clean = img.cloneNode(true);
      img.parentNode.replaceChild(clean, img);

      // event handlers
      const onMove = (e) => {
        const rect = clean.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        clean.style.transformOrigin = `${x}% ${y}%`;
      };
      const onEnter = () => clean.classList.add("zoomed");
      const onLeave = () => clean.classList.remove("zoomed");
      const onClickToggle = () => clean.classList.toggle("zoomed"); // useful for touch devices

      clean.addEventListener("mousemove", onMove);
      clean.addEventListener("mouseenter", onEnter);
      clean.addEventListener("mouseleave", onLeave);
      clean.addEventListener("click", onClickToggle);
    }

    // Attach click handlers to thumbnails
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => {
        // update active class
        thumbs.forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");

        const src = product.images[i];
        renderMain(src);
      });
    });

    // If initial main is image, enable zoom immediately
    if (!firstIsVideo) enableZoom();

  } else {
    detailContainer.innerHTML = "<p>No product selected.</p>";
  }
}

  const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
  });
}

});




