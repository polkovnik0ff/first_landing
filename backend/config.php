<?php
// ════════════════════════════════════════════
//  Настройки сайта — редактируйте только этот файл
// ════════════════════════════════════════════

// Домен сайта — используется для CORS и проверки Origin
define('SITE_DOMAIN', 'https://market.opalubka365.ru');

// Google reCAPTCHA v2 ("Я не робот")
define('RECAPTCHA_SECRET', 'ВСТАВЬТЕ_SECRET_KEY_V2');  // секретный ключ из console.cloud.google.com

// Куда приходят заявки (можно добавлять/убирать адреса)
define('MAIL_RECIPIENTS', [
    ['email' => 'kemandy@mail.ru',      'name' => 'Менеджер 1'],
    ['email' => 'второй@example.com',   'name' => 'Менеджер 2'],
    ['email' => 'третий@example.com',   'name' => 'Менеджер 3'],
]);

// С какого адреса отправляется письмо (Яндекс-аккаунт)
define('SMTP_USER', 'a42site@yandex.ru');

// Пароль читается из переменной окружения SMTP_PASS.
// Как задать на TimeWeb (через SSH):
//   echo "export SMTP_PASS='ваш_пароль'" >> ~/.bashrc && source ~/.bashrc
// Или через панель TimeWeb → «Переменные окружения» (если есть).
// Если 2FA — используйте «Пароли приложений» в настройках Яндекс ID.
define('SMTP_PASS', getenv('SMTP_PASS') ?: 'ВСТАВЬТЕ_ПАРОЛЬ_ЗДЕСЬ');

define('MAIL_FROM',      SMTP_USER);
define('MAIL_FROM_NAME', 'Сайт Статика-С');

// SMTP — Яндекс (не трогайте, если используете @yandex.ru)
define('SMTP_HOST', 'smtp.yandex.ru');
define('SMTP_PORT', 465);   // SSL

// Файл хранения заявок.
// Рекомендуется перенести за пределы public_html, например:
//   define('LEADS_FILE', '/home/username/leads/leads.csv');
// Папку нужно создать вручную: mkdir ~/leads
define('LEADS_FILE', '/home/c/ck33033/market/leads/leads.csv');


