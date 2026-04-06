(function () {

  // ═══ Calculator ═══
  function calculate() {
    var type     = parseInt(document.getElementById('calcType')?.value     || '0', 10) || 0;
    var area     = parseInt(document.getElementById('calcArea')?.value     || '0', 10) || 0;
    var months   = parseInt(document.getElementById('calcMonths')?.value   || '0', 10) || 0;
    var delivery = parseInt(document.getElementById('calcDelivery')?.value || '0', 10) || 0;
    var total    = (type * area * months) + delivery;
    var el = document.getElementById('calcResult');
    if (el) el.textContent = total.toLocaleString('ru-RU') + ' ₽';
  }
  calculate();

  // ═══ Modal ═══
  function openModal() {
    var m = document.getElementById('modal');
    if (!m) return;
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    var m = document.getElementById('modal');
    if (!m) return;
    m.classList.remove('active');
    document.body.style.overflow = '';
  }
  var modalEl = document.getElementById('modal');
  if (modalEl) {
    modalEl.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // ═══ Mobile nav ═══
  function closeMobileNav() {
    var nav    = document.getElementById('mobileNav');
    var burger = document.getElementById('burger');
    if (nav)    nav.classList.remove('open');
    if (burger) burger.classList.remove('open');
  }
  var burgerBtn = document.getElementById('burger');
  if (burgerBtn) {
    burgerBtn.addEventListener('click', function () {
      var nav = document.getElementById('mobileNav');
      if (!nav) return;
      var isOpen = nav.classList.toggle('open');
      burgerBtn.classList.toggle('open', isOpen);
    });
  }

  // ═══ Header scroll effect ═══
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ═══ Floating CTA reveal ═══
  var floatCta = document.getElementById('floatCta');
  if (floatCta) {
    window.addEventListener('scroll', function () {
      floatCta.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
  }

  // ═══ Scroll reveal ═══
  var revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ═══ Smooth scroll ═══
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileNav();
      }
    });
  });

  // ═══ Form validation ═══
  document.querySelectorAll('.lead-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errorEl   = form.querySelector('.form-error');
      var successEl = form.querySelector('.form-success');
      if (errorEl)   { errorEl.classList.remove('visible'); errorEl.textContent = ''; }
      if (successEl) { successEl.classList.remove('visible'); }

      var fields = form.querySelectorAll('[required]');
      var hasEmpty = false;
      fields.forEach(function (f) {
        if (!f.value.trim()) { f.style.borderColor = '#d83b2d'; hasEmpty = true; }
        else { f.style.borderColor = ''; }
      });

      if (hasEmpty) {
        if (errorEl) { errorEl.textContent = 'Заполните обязательные поля.'; errorEl.classList.add('visible'); }
        return;
      }

      if (successEl) successEl.classList.add('visible');
      form.reset();

      if (form.classList.contains('lead-form-modal')) {
        setTimeout(closeModal, 900);
      }
    });
  });

  // Expose globals for inline onclick handlers
  window.openModal    = openModal;
  window.closeModal   = closeModal;
  window.calculate    = calculate;
  window.closeMobileNav = closeMobileNav;

})();
