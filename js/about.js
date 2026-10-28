/* About page — additional interactions beyond main.js */
(function () {
  /* Scroll-to-top button for long about page */
  var scrollToTop = document.getElementById('scrollToTop');
  var hero = document.getElementById('about-hero');

  if (scrollToTop && hero) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > hero.offsetHeight) {
        scrollToTop.classList.add('visible');
      } else {
        scrollToTop.classList.remove('visible');
      }
    });

    scrollToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
