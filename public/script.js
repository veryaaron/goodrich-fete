/* ============================================================
   GOODRICH SUMMER FETE 2026 — Interactive Script
   ============================================================ */

(function () {
  'use strict';

  // ---- Loader ----
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('is-hidden'), 900);
  });

  // ---- Navigation ----
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  let lastScroll = 0;

  function handleScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 60);
    lastScroll = y;
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    navLinks.classList.toggle('is-open');
    document.body.style.overflow = navLinks.classList.contains('is-open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      navLinks.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll with offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---- Countdown Timer ----
  const feteDate = new Date('2026-06-27T12:00:00+01:00'); // BST

  function updateCountdown() {
    const now = new Date();
    const diff = feteDate - now;

    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = '<p style="font-size:1.3rem;font-weight:600">The fete is here! See you there!</p>';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setUnit('countDays', days);
    setUnit('countHours', hours);
    setUnit('countMinutes', minutes);
    setUnit('countSeconds', seconds);
  }

  function setUnit(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const str = String(value).padStart(2, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 300);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---- Scroll Reveal (Intersection Observer) ----
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  // ---- Parallax ----
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  function handleParallax() {
    const scrollY = window.scrollY;
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.parentElement ? el.parentElement.getBoundingClientRect() : el.getBoundingClientRect();
      const offset = (scrollY + window.innerHeight - rect.top - scrollY) * speed;
      el.style.transform = `translateY(${offset * 0.3}px)`;
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ---- Hero YouTube Background ----
  let heroPlayer = null;
  let heroSoundOn = false;
  const heroVideoEl = document.getElementById('heroVideo');
  const heroSoundBtn = document.getElementById('heroSoundBtn');

  // YouTube API calls this globally when ready
  window.onYouTubeIframeAPIReady = function () {
    // Don't init on mobile (video is hidden via CSS)
    if (window.innerWidth <= 768) return;

    heroPlayer = new YT.Player('ytPlayer', {
      videoId: 'xQjKBU6a5K8',
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        showinfo: 0,
        rel: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        disablekb: 1,
        fs: 0,
        playsinline: 1,
        loop: 1,
        playlist: 'xQjKBU6a5K8', // required for loop to work
      },
      events: {
        onReady: function (e) {
          e.target.playVideo();
        },
        onStateChange: function (e) {
          // Show video once it starts playing
          if (e.data === YT.PlayerState.PLAYING && heroVideoEl) {
            heroVideoEl.classList.add('is-ready');
          }
          // Restart if ended (backup for loop)
          if (e.data === YT.PlayerState.ENDED) {
            e.target.seekTo(0);
            e.target.playVideo();
          }
        },
      },
    });
  };

  // Sound toggle
  if (heroSoundBtn) {
    heroSoundBtn.addEventListener('click', function () {
      if (!heroPlayer) return;
      heroSoundOn = !heroSoundOn;
      if (heroSoundOn) {
        heroPlayer.unMute();
        heroPlayer.setVolume(60);
        heroSoundBtn.classList.add('is-playing');
        heroSoundBtn.querySelector('span').textContent = 'Sound on';
      } else {
        heroPlayer.mute();
        heroSoundBtn.classList.remove('is-playing');
        heroSoundBtn.querySelector('span').textContent = 'Watch with sound';
      }
    });
  }

  // ---- Hero Particles ----
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer) {
    const colors = ['rgba(255,255,255,0.25)', 'rgba(212,168,67,0.2)', 'rgba(196,86,112,0.15)'];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero__particle';
      const size = 3 + Math.random() * 5;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDuration = (15 + Math.random() * 25) + 's';
      particle.style.animationDelay = (Math.random() * 20) + 's';
      particleContainer.appendChild(particle);
    }
  }

  // ---- Video Player ----
  const videoPoster = document.getElementById('videoPoster');
  const videoIframe = document.getElementById('videoIframe');
  const videoPlayBtn = document.getElementById('videoPlayBtn');

  if (videoPoster && videoIframe) {
    const playVideo = () => {
      videoIframe.src = 'https://www.youtube.com/embed/xQjKBU6a5K8?autoplay=1&rel=0&modestbranding=1';
      videoPoster.classList.add('is-hidden');
    };
    videoPoster.addEventListener('click', playVideo);
  }

  // ---- Contact Form ----
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      status.textContent = '';
      status.className = 'form__status';

      try {
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          status.textContent = 'Thank you! We\'ll be in touch soon.';
          status.classList.add('form__status--success');
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        status.textContent = 'Something went wrong. Please email us directly at hello@goodrichfete.com';
        status.classList.add('form__status--error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }
})();
