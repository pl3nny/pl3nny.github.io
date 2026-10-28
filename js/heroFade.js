/* Home page — hero content fades and avatar shrinks on scroll */
(function () {
  var heroContent = document.getElementById('heroContent');
  var heroAvatar = document.querySelector('.hero-avatar');
  if (!heroContent) return;

  var navbar = document.getElementById('navbar');
  var navbarHeight = navbar ? navbar.offsetHeight : 60;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Capture hero avatar's initial viewport position once */
  var heroInitialRect = heroAvatar ? heroAvatar.getBoundingClientRect() : null;

  window.addEventListener('scroll', function () {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var fadeStart = navbarHeight * 0.5;
    var fadeEnd = navbarHeight * 2;

    /* Fade hero content */
    if (scrollY <= fadeStart) {
      heroContent.style.opacity = '1';
    } else if (scrollY >= fadeEnd) {
      heroContent.style.opacity = '0';
    } else {
      var progress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
      heroContent.style.opacity = 1 - progress;
    }

    /* Animate hero avatar shrink + fly toward navbar */
    if (heroAvatar && heroInitialRect) {
      var avatarFadeStart = navbarHeight * 0.5;
      var avatarFadeEnd = navbarHeight * 5;
      var navbarAvatar = document.querySelector('.nav-avatar');

      if (scrollY <= avatarFadeStart) {
        heroAvatar.style.opacity = '1';
        heroAvatar.style.transform = 'translate(0, 0) scale(1)';
      } else if (scrollY >= avatarFadeEnd) {
        heroAvatar.style.opacity = '0';
        heroAvatar.style.transform = 'translate(0, 0) scale(0.15)';
      } else {
        /* Recalculate delta each scroll — hero avatar moves in viewport as page scrolls */
        var currentHeroRect = heroAvatar.getBoundingClientRect();
        var navRect = navbarAvatar ? navbarAvatar.getBoundingClientRect() : null;
        var dx = navRect
          ? navRect.left + navRect.width / 2 - (currentHeroRect.left + currentHeroRect.width / 2)
          : 0;
        var dy = navRect
          ? navRect.top + navRect.height / 2 - (currentHeroRect.top + currentHeroRect.height / 2)
          : 0;

        var progress = (scrollY - avatarFadeStart) / (avatarFadeEnd - avatarFadeStart);
        var eased = prefersReducedMotion ? progress : (1 - Math.pow(1 - progress, 3));
        heroAvatar.style.opacity = 1 - progress;
        heroAvatar.style.transform =
          'translate(' + dx * eased + 'px, ' + dy * eased + 'px) scale(' + (1 - 0.85 * eased) + ')';
      }
    }
  });
})();
