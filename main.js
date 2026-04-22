/* ─────────────────────────────────────────
   SCROLL REVEAL — IntersectionObserver
───────────────────────────────────────── */
(function () {
  'use strict';

  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.13, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));

  /* ─────────────────────────────────────
     NAVBAR — glass on scroll
  ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  // Apply glass immediately on load (not just on scroll)
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* ─────────────────────────────────────
     SLIDER — infinite loop (bug-fixed)
  ───────────────────────────────────── */
  const wrapper     = document.querySelector('.slider-wrapper');
  const track       = document.getElementById('sliderTrack');
  const btnPrev     = document.getElementById('sliderPrev');
  const btnNext     = document.getElementById('sliderNext');
  const dots        = document.querySelectorAll('.dot');
  const origSlides  = Array.from(document.querySelectorAll('.slide'));
  const total       = origSlides.length;
  let position      = 1;
  let autoTimer     = null;
  let safetyTimer   = null;
  let isAnimating   = false;   // guard: block calls mid-transition
  let isHovering    = false;   // track hover so visibilitychange doesn't restart auto while hovering

  if (track && total > 0) {
    // Clone first + last for seamless wrap
    // Layout: [clone-last | slide0…slideN-1 | clone-first]
    // Positions:    0     |   1  …  total   |   total+1
    track.appendChild(origSlides[0].cloneNode(true));
    track.prepend(origSlides[total - 1].cloneNode(true));

    const getAllSlides = () => track.querySelectorAll('.slide');

    function setSlideSizes() {
      if (!wrapper) return;
      const w = wrapper.clientWidth;
      getAllSlides().forEach(s => {
        s.style.width    = w + 'px';
        s.style.minWidth = w + 'px';
      });
    }

    function updateDots() {
      const dotIdx = ((position - 1) + total) % total;
      dots.forEach((d, i) => d.classList.toggle('active', i === dotIdx));
    }

    function goTo(idx, animated = true) {
      if (!wrapper || !track) return;
      // FIX 1: ignore calls while a transition is already running
      if (animated && isAnimating) return;

      const gap = 24;

      if (animated) {
        clearTimeout(safetyTimer);
        track.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
        // FIX 4: flush transition BEFORE changing transform so browsers don't batch
        // them as a single instant update (critical after a transition:none jump)
        void track.offsetHeight;
        isAnimating = true;
        // FIX 5: safety net — if transitionend never fires (hidden tab, throttle,
        // same-position call) reset the guard so the slider doesn't freeze forever
        safetyTimer = setTimeout(() => { isAnimating = false; }, 900);
      } else {
        track.style.transition = 'none';
      }

      position = idx;
      track.style.transform = `translateX(-${position * (wrapper.clientWidth + gap)}px)`;

      // Force a reflow when not animating so the 'none' transition is applied immediately
      // This prevents visual glitches on wrap-around
      if (!animated) {
        void track.offsetHeight;
      }

      updateDots();
    }

    // FIX 2: filter transitionend — only react on the TRACK itself,
    // only for the 'transform' property (avoids child-element ghost events)
    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return;

      clearTimeout(safetyTimer);

      if (position === 0) {
        goTo(total, false);          // clone of last → real last
      } else if (position === total + 1) {
        goTo(1, false);              // clone of first → real first
      }
      isAnimating = false;
    });

    function next() { goTo(position + 1, true); }
    function prev() { goTo(position - 1, true); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 5000);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    if (btnNext) btnNext.addEventListener('click', () => { next(); startAuto(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { prev(); startAuto(); });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.idx, 10);
        if (isNaN(idx)) return;
        goTo(idx + 1);
        startAuto();
      });
    });

    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => { isHovering = true;  stopAuto();  });
      wrapper.addEventListener('mouseleave', () => { isHovering = false; startAuto(); });
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        isAnimating = false;
        setSlideSizes();
        goTo(position, false);
      }, 100);
    }, { passive: true });

    // FIX 3: Page Visibility API — pause when tab is hidden,
    // resume when it comes back. Prevents timer queue buildup.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAuto();
      } else {
        // reset animation state in case a transition was cut off
        isAnimating = false;
        if (!isHovering) startAuto();
      }
    });

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
      startAuto();
    }, { passive: true });

    // Init
    setSlideSizes();
    goTo(1, false);
    startAuto();
  }

  /* ─────────────────────────────────────
     WHATSAPP BUBBLE
     · Aparece altiro al cargar
     · Se oculta cuando la sección de contacto es visible
  ───────────────────────────────────── */
  const waBubble = document.getElementById('wa-bubble');

  // 1) Aparece altiro al cargar la página
  if (waBubble) {
    waBubble.classList.add('visible');
  }

  // 2) Se oculta cuando la sección "#contacto" está en pantalla
  const contactSection = document.getElementById('contacto');
  if (contactSection && waBubble) {
    const contactObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          waBubble.classList.add('wa-hidden');
        } else {
          waBubble.classList.remove('wa-hidden');
        }
      },
      { threshold: 0.15 }   // oculta cuando ≥15% de la sección es visible
    );
    contactObserver.observe(contactSection);
  }

  /* ─────────────────────────────────────
     CONTACT FORM — pre-filled WA link
  ───────────────────────────────────── */
  const form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nombre  = document.getElementById('nombre').value.trim();
      const empresa = document.getElementById('empresa').value.trim();
      const tel     = document.getElementById('tel').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      const empresaStr = empresa ? `%20(${encodeURIComponent(empresa)})` : '';
      const text =
        `Hola%2C%20soy%20${encodeURIComponent(nombre)}${empresaStr}.%0A` +
        `Tel%C3%A9fono%3A%20${encodeURIComponent(tel)}%0A%0A` +
        `${encodeURIComponent(mensaje)}`;

      // ⚠ Reemplazá 5491100000000 con el número real
      window.open(`https://wa.me/5491100000000?text=${text}`, '_blank');

      const btn = document.getElementById('submit-btn');
      const original = btn.textContent;
      btn.textContent = '¡Enviado! Redirigiendo a WhatsApp…';
      btn.disabled = true; btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false; btn.style.opacity = '';
        form.reset();
      }, 3500);
    });
  }

  /* ─────────────────────────────────────
     ACTIVE NAV LINK highlight
  ───────────────────────────────────── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const secObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => {
            a.style.color = '';
            if (a.getAttribute('href') === `#${entry.target.id}`) {
              a.style.color = 'var(--accent)';
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => secObserver.observe(s));

})();
