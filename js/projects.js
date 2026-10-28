/* Projects page — lightbox for astro gallery */
(function () {
  var lightbox = document.getElementById('gallery-lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  var prevBtn = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  var nextBtn = lightbox ? lightbox.querySelector('.lightbox-next') : null;
  var items = lightbox ? Array.from(document.querySelectorAll('.gallery-item')) : [];
  var currentIndex = 0;

  if (!lightbox || items.length === 0) return;

  function showImage(index) {
    var item = items[index];
    var heroSrc = item.getAttribute('data-hero-src');
    var caption = item.getAttribute('data-caption');
    var alt = item.querySelector('img').getAttribute('alt');
    lightboxImg.src = heroSrc;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = caption;
    currentIndex = index;
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function hideLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function prevImage() {
    var next = (currentIndex - 1 + items.length) % items.length;
    showImage(next);
  }

  function nextImage() {
    var next = (currentIndex + 1) % items.length;
    showImage(next);
  }

  // Click on gallery item opens lightbox
  items.forEach(function (item, index) {
    item.addEventListener('click', function () {
      showImage(index);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', hideLightbox);
  if (prevBtn) prevBtn.addEventListener('click', prevImage);
  if (nextBtn) nextBtn.addEventListener('click', nextImage);

  // Click outside image closes lightbox
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      hideLightbox();
    }
  });

  // Keyboard: Escape to close, arrows to navigate
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });
})();
