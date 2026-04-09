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
  // Сбрасываем состояние благодарности для следующего открытия
  const form = document.querySelector('.lead-form-modal');
  const thankYou = document.getElementById('modalThankYou');
  const disclaimer = document.getElementById('modalDisclaimer');
  if (form) form.style.display = '';
  if (thankYou) thankYou.style.display = 'none';
  if (disclaimer) disclaimer.style.display = '';
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

// ═══ Маска телефона ═══
function initPhoneMask(input) {
  const MASK  = '+7 (___) ___-__-__';
  const SLOTS = [4, 5, 6, 9, 10, 11, 13, 14, 16, 17]; // позиции _ в маске

  // Извлечь только цифры абонента (без кода страны)
  function toDigits(val) {
    let d = val.replace(/\D/g, '');
    if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1);
    return d.slice(0, 10);
  }

  // Вставить цифры в шаблон маски
  function render(digits) {
    const chars = MASK.split('');
    [...digits].forEach((ch, i) => { chars[SLOTS[i]] = ch; });
    return chars.join('');
  }

  // Позиция курсора после последней введённой цифры
  function nextSlot(digits) {
    return digits.length < SLOTS.length ? SLOTS[digits.length] : MASK.length;
  }

  // Применить маску и поставить курсор
  function apply(digits) {
    input.value = render(digits);
    const pos = nextSlot(digits);
    input.setSelectionRange(pos, pos);
  }

  input.addEventListener('focus', () => {
    if (!input.value) apply('');
    else {
      const pos = nextSlot(toDigits(input.value));
      input.setSelectionRange(pos, pos);
    }
  });

  input.addEventListener('blur', () => {
    // Очищаем поле если не введено ни одной цифры — вернётся placeholder
    if (toDigits(input.value).length === 0) input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      apply(toDigits(input.value).slice(0, -1));
    }
  });

  input.addEventListener('input', () => {
    apply(toDigits(input.value));
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    apply(toDigits(e.clipboardData.getData('text')));
  });
}

document.querySelectorAll('input[type="tel"]').forEach(initPhoneMask);

// ═══ Отправка форм ═══
document.querySelectorAll('.lead-form').forEach((form) => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const error   = form.querySelector('.form-error');
    const success = form.querySelector('.form-success');
    const btn     = form.querySelector('[type="submit"]');

    if (error)   { error.classList.remove('visible'); error.textContent = ''; }
    if (success) { success.classList.remove('visible'); }

    // Клиентская валидация
    let hasError = false;
    let errorMsg = '';

    form.querySelectorAll('[required]').forEach((field) => {
      const isEmpty = !field.value.trim();
      const isPhone = field.type === 'tel';
      const phoneIncomplete = isPhone && field.value.replace(/\D/g, '').length < 11;

      if (isEmpty || phoneIncomplete) {
        field.style.borderColor = '#d83b2d';
        if (!hasError) {
          errorMsg = isPhone && !isEmpty ? 'Введите полный номер телефона.' : 'Заполните обязательные поля.';
        }
        hasError = true;
      } else {
        field.style.borderColor = '';
      }
    });

    if (hasError) {
      if (error) { error.textContent = errorMsg; error.classList.add('visible'); }
      return;
    }

    // Отправка на сервер
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Отправка…';

    const data = new FormData(form);
    data.append('source', form.classList.contains('lead-form-modal') ? 'modal' : 'main');

    fetch('backend/submit.php', { method: 'POST', body: data })
      .then(r => r.json())
      .then(res => {
        if (res.ok) {
          form.reset();
          if (form.classList.contains('lead-form-modal')) {
            form.style.display = 'none';
            const thankYou = document.getElementById('modalThankYou');
            const disclaimer = document.getElementById('modalDisclaimer');
            if (thankYou) thankYou.style.display = 'block';
            if (disclaimer) disclaimer.style.display = 'none';
          } else {
            if (success) success.classList.add('visible');
          }
        } else {
          if (error) { error.textContent = res.error || 'Ошибка отправки. Попробуйте позже.'; error.classList.add('visible'); }
        }
      })
      .catch(() => {
        if (error) { error.textContent = 'Ошибка сети. Попробуйте ещё раз.'; error.classList.add('visible'); }
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = origText;
      });
  });
});

  window.openModal  = openModal;
  window.closeModal = closeModal;
  window.calculate  = calculate;
})();