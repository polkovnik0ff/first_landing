(function () {
// ═══ Calculator ═══
function calculate() {
  const type = parseInt(document.getElementById('calcType').value, 10) || 0;
  const area = parseInt(document.getElementById('calcArea').value, 10) || 0;
  const months = parseInt(document.getElementById('calcMonths').value, 10) || 0;
  const delivery = parseInt(document.getElementById('calcDelivery')?.value || '0', 10) || 0;

  const total = (type * area * months) + delivery;
  document.getElementById('calcResult').textContent =
    total.toLocaleString('ru-RU') + ' ₽';
}


function initFormSectionGlow() {
  const section = document.querySelector('.form-section');
  if (!section) return;

  const setPoint = (x, y) => {
    const rect = section.getBoundingClientRect();
    const px = ((x - rect.left) / rect.width) * 100;
    const py = ((y - rect.top) / rect.height) * 100;
    section.style.setProperty('--form-mx', px + '%');
    section.style.setProperty('--form-my', py + '%');
  };

  section.addEventListener('mousemove', (e) => {
    setPoint(e.clientX, e.clientY);
  });

  section.addEventListener('mouseleave', () => {
    section.style.setProperty('--form-mx', '50%');
    section.style.setProperty('--form-my', '50%');
  });

  section.addEventListener('touchmove', (e) => {
    const t = e.touches && e.touches[0];
    if (t) setPoint(t.clientX, t.clientY);
  }, { passive: true });
}

function initCustomSelect() {
  const custom = document.getElementById('calcTypeCustom');
  if (!custom) return;
  const trigger = custom.querySelector('.custom-select-trigger');
  const native = custom.querySelector('#calcType');
  const options = Array.from(custom.querySelectorAll('.custom-select-option'));

  function closeSelect() {
    custom.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function openSelect() {
    custom.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (custom.classList.contains('open')) closeSelect();
    else openSelect();
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const value = option.dataset.value;
      const text = option.textContent.trim();
      native.value = value;
      trigger.textContent = text;
      options.forEach(o => {
        o.classList.remove('active');
        o.setAttribute('aria-selected', 'false');
      });
      option.classList.add('active');
      option.setAttribute('aria-selected', 'true');
      closeSelect();
      calculate();
    });
  });

  document.addEventListener('click', (e) => {
    if (!custom.contains(e.target)) closeSelect();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSelect();
  });
}

calculate();
initCustomSelect();
initFormSectionGlow();

// ═══ Scroll reveal ═══
const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// ═══ Modal ═══
function openModal() {
  document.getElementById('modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ═══ Smooth scroll ═══
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    const t = document.querySelector(this.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

// ═══ Simple validation for demo forms ═══
document.querySelectorAll('.lead-form').forEach((form) => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const error = form.querySelector('.form-error');
    const success = form.querySelector('.form-success');
    if (error) {
      error.classList.remove('visible');
      error.textContent = '';
    }
    if (success) success.classList.remove('visible');

    const requiredFields = form.querySelectorAll('[required]');
    let hasEmpty = false;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = '#d83b2d';
        hasEmpty = true;
      } else {
        field.style.borderColor = '';
      }
    });

    if (hasEmpty) {
      if (error) {
        error.textContent = 'Заполните обязательные поля.';
        error.classList.add('visible');
      }
      return;
    }

    if (success) success.classList.add('visible');
    form.reset();

    if (form.classList.contains('lead-form-modal')) {
      setTimeout(closeModal, 900);
    }
  });
});

  window.openModal  = openModal;
  window.closeModal = closeModal;
  window.calculate  = calculate;
})();