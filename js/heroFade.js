/* Home page — hero content fades on scroll */
(function () {
  var heroContent = document.getElementById('heroContent');
  if (!heroContent) return;

  var navbar = document.getElementById('navbar');
  var navbarHeight = navbar ? navbar.offsetHeight : 60;

  window.addEventListener('scroll', function () {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var fadeStart = navbarHeight * 0.5;
    var fadeEnd = navbarHeight * 2;
    
    if (scrollY <= fadeStart) {
      heroContent.style.opacity = '1';
    } else if (scrollY >= fadeEnd) {
      heroContent.style.opacity = '0';
    } else {
      var progress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
      heroContent.style.opacity = 1 - progress;
    }
  });
})();
