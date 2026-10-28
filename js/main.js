/* Mobile navigation toggle */
(function () {
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav when a link is clicked
    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        if (navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* Smooth scroll fallback for browsers that don't support scroll-behavior: smooth */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var j = 0; j < anchors.length; j++) {
    anchors[j].addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = document.getElementById('navbar') ? document.getElementById('navbar').offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
        // Update URL without scrolling
        history.pushState(null, null, targetId);
      }
    });
  }

  /* Active nav link highlighting on scroll (IntersectionObserver) */
  var sections = document.querySelectorAll('section[id], header[id]');
  var navItems = navLinks ? navLinks.querySelectorAll('a') : [];

  if (sections.length && navItems.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navItems.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();
