/* =============================================
   SPARKCHARGE - Main JavaScript
   GSAP Animations, Counters, Testimonials
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Preloader ----
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
      preloader.classList.add('hidden');
      initAnimations();
    }, 1200);
  });

  // Fallback: hide preloader after 3s max
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      initAnimations();
    }
  }, 3000);

  // ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('mainNav');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top
    if (scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Active Nav Link ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // ---- Smooth Scroll for Nav Links ----
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          // Close mobile menu
          const navCollapse = document.getElementById('navbarContent');
          if (navCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
            if (bsCollapse) bsCollapse.hide();
          }
        }
      }
    });
  });

  // ---- Scroll Animations ----
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Animate elements on scroll
    const animElements = document.querySelectorAll('[data-animate]');
    animElements.forEach((el, i) => {
      const delay = parseFloat(el.getAttribute('data-delay')) || 0;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            delay: delay,
            ease: 'power3.out',
            onStart: () => el.classList.add('animated')
          });
        }
      });
    });

    // Hero entrance animation
    const heroTl = gsap.timeline({ delay: 1.4 });
    heroTl
      .from('.hero-badge', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' })
      .from('.hero-title', { opacity: 0, y: 40, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .from('.hero-description', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .from('.hero-actions', { opacity: 0, y: 25, duration: 0.6, ease: 'power3.out' }, '-=0.3')
      .from('.hero-stats', { opacity: 0, y: 25, duration: 0.6, ease: 'power3.out' }, '-=0.3')
      .from('.hero-image-wrapper', { opacity: 0, scale: 0.9, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .from('.hero-floating-card', { opacity: 0, scale: 0.8, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.2 }, '-=0.4')
      .from('.hero-scroll-indicator', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out' }, '-=0.2');

    // Parallax shapes
    gsap.to('.shape-1', {
      y: -80,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
    gsap.to('.shape-2', {
      y: 60,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Counter animations
    initCounters();

    // Feature card stagger
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        y: 40,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Step cards
    gsap.utils.toArray('.step-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        y: 50,
        duration: 0.7,
        delay: i * 0.15,
        ease: 'power3.out'
      });
    });

    // Pricing cards
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.7,
        delay: i * 0.15,
        ease: 'power3.out'
      });
    });

    // Stat cards
    gsap.utils.toArray('.stat-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Floating card gentle animation
    gsap.to('.card-1', {
      y: -10,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
    gsap.to('.card-2', {
      y: 10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Map pin pulse
    gsap.from('.map-overlay-card', {
      scrollTrigger: {
        trigger: '.station-map-wrapper',
        start: 'top 70%',
        once: true
      },
      opacity: 0,
      y: 20,
      scale: 0.9,
      duration: 0.7,
      ease: 'back.out(1.7)'
    });
  }

  // ---- Counter Animation ----
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          animateCounter(counter, target);
        }
      });
    });
  }

  function animateCounter(el, target) {
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  // ---- Testimonial Carousel ----
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track && dotsContainer && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.testimonial-card');
    let currentSlide = 0;
    let autoSlideInterval;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonial-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    function goToSlide(index) {
      currentSlide = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    }

    function updateDots() {
      dotsContainer.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % cards.length;
      goToSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + cards.length) % cards.length;
      goToSlide(currentSlide);
    }

    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoSlide();
    });

    // Auto slide
    function startAutoSlide() {
      autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    startAutoSlide();

    // Touch / Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
        resetAutoSlide();
      }
    }, { passive: true });
  }

});
