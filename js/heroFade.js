/* Home page — hero text fades out and the avatar flies into the navbar on scroll.
 *
 * The hero avatar can't be drawn above the fixed navbar from inside the hero
 * (the hero is its own stacking context), so during the flight a fixed-position
 * copy ("flyer") is shown above the navbar while the original is hidden. The
 * flyer lands exactly on the navbar avatar, which is the same photo, so the
 * hand-off is seamless.
 */
(function () {
  var heroContent = document.getElementById('heroContent');
  if (!heroContent) return;

  var heroAvatar = heroContent.querySelector('.hero-avatar');
  var navAvatar = document.querySelector('.nav-avatar');
  var navbar = document.getElementById('navbar');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Everything in the hero except the avatar fades; the avatar has its own animation */
  var fadeItems = Array.prototype.filter.call(heroContent.children, function (el) {
    return el !== heroAvatar;
  });

  var flyer = null;
  if (heroAvatar && navAvatar) {
    flyer = heroAvatar.cloneNode(false);
    flyer.removeAttribute('id');
    flyer.alt = '';
    flyer.setAttribute('aria-hidden', 'true');
    flyer.style.cssText =
      'position:fixed;left:0;top:0;margin:0;z-index:1001;pointer-events:none;' +
      'transform-origin:50% 50%;will-change:transform,opacity;display:none;';
    document.body.appendChild(flyer);
  }

  var navbarHeight = 60;
  var geo = null; /* measured once (and on resize) — never read back mid-animation */
  var ticking = false;

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function measure() {
    navbarHeight = navbar ? navbar.offsetHeight : 60;
    if (!flyer) return;
    var hero = heroAvatar.getBoundingClientRect(); /* original is never transformed */
    var nav = navAvatar.getBoundingClientRect(); /* navbar is fixed, so this never moves */
    geo = {
      x: hero.left + hero.width / 2, /* avatar centre, page coordinates */
      y: hero.top + hero.height / 2 + window.pageYOffset,
      w: hero.width,
      h: hero.height,
      navX: nav.left + nav.width / 2, /* navbar avatar centre, viewport coordinates */
      navY: nav.top + nav.height / 2,
      endScale: nav.width / hero.width
    };
  }

  function showOriginal(opacity) {
    heroAvatar.style.visibility = '';
    heroAvatar.style.opacity = opacity;
    if (flyer) flyer.style.display = 'none';
  }

  function render() {
    ticking = false;
    var scrollY = window.pageYOffset;

    /* Hero text fades out gradually */
    var textStart = navbarHeight * 0.5;
    var textEnd = navbarHeight * 4;
    var t = clamp01((scrollY - textStart) / (textEnd - textStart));
    for (var i = 0; i < fadeItems.length; i++) {
      fadeItems[i].style.opacity = t ? 1 - t : '';
    }

    if (!heroAvatar) return;

    var avatarStart = navbarHeight * 0.5;
    var avatarEnd = navbarHeight * 8;
    var p = clamp01((scrollY - avatarStart) / (avatarEnd - avatarStart));

    if (!flyer || !geo || reduceMotion.matches) {
      showOriginal(p ? 1 - p : '');
      return;
    }

    if (p === 0) {
      showOriginal('');
      return;
    }

    heroAvatar.style.visibility = 'hidden';

    if (p === 1) {
      flyer.style.display = 'none'; /* the navbar avatar has taken over */
      return;
    }

    var e = easeInOut(p);
    /* Where the avatar would naturally be on screen, held at or below the
       navbar avatar so the path never overshoots it */
    var naturalY = Math.max(geo.y - scrollY, geo.navY);
    var cx = geo.x + (geo.navX - geo.x) * e;
    var cy = naturalY + (geo.navY - naturalY) * e;
    var scale = 1 + (geo.endScale - 1) * e;

    flyer.style.display = 'block';
    flyer.style.width = geo.w + 'px';
    flyer.style.height = geo.h + 'px';
    flyer.style.transform =
      'translate3d(' + (cx - geo.w / 2).toFixed(2) + 'px,' + (cy - geo.h / 2).toFixed(2) + 'px,0)' +
      ' scale(' + scale.toFixed(4) + ')';
    flyer.style.opacity = '';
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  }

  function remeasure() {
    measure();
    requestRender();
  }

  measure();
  render();

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure); /* fonts/images can shift layout */
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', requestRender);
})();
