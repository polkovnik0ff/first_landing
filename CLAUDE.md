# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page for **Статика-С** — a Russian formwork (опалубка) rental company. The site captures leads via contact forms, stores them to CSV, and sends email notifications via Yandex SMTP.

There is no build step, no package manager, no test suite. All files are served directly by Apache on a TimeWeb shared hosting server.

## Stack

- **Frontend**: Vanilla HTML5 / CSS3 / ES6+ JavaScript (no framework, no bundler)
- **Backend**: PHP (single endpoint `backend/submit.php`)
- **Email**: Custom socket-based SMTP client in `submit.php` — no PHPMailer or other libraries
- **Storage**: Flat CSV file (`backend/leads.csv`) — no database
- **Web server**: Apache with `.htaccess`

## Architecture

```
index.html          ← Main production page
new/index.html      ← Alternative design iteration (not yet deployed)
backend/
  config.php        ← All site settings: SMTP credentials, recipients, reCAPTCHA keys, file paths
  submit.php        ← Single form handler: sanitize → validate → honeypot → reCAPTCHA → rate-limit → CSV → email
  .htaccess         ← Blocks direct access to config.php and leads.csv; security headers
css/style.css       ← Styles for main index.html
js/script.js        ← All frontend logic for main index.html
new/css/, new/js/   ← Styles and scripts for the new/ design version
img/                ← Static images
img/catalog/        ← Product photos for catalog cards (1.jpg–6.jpg, 9.webp)
```

### Section order in index.html (top → bottom)

1. Hero
2. Социальное доказательство (логотипы)
3. Калькулятор
4. Каталог оборудования — карточки с фото из `img/catalog/`
5. Что вы получаете (benefits)
6. Как мы работаем
7. Контактная форма
8. Footer

### Form submission flow

1. `js/script.js` validates client-side (phone mask, required fields), then POSTs to `/backend/submit.php`
2. `submit.php`: sanitize → honeypot check → reCAPTCHA v2 verify → CSRF/Origin check → rate-limit → append to `leads.csv` → send HTML email via Yandex SMTP
3. Returns `{"ok": true}` or `{"ok": false, "error": "..."}` as JSON

### Two form instances

Both forms on `index.html` (main contact form and modal) post to the same endpoint. The `source` field (`main` | `modal`) distinguishes them in the CSV and email.

## Configuration

All runtime settings live in `backend/config.php`:
- `MAIL_RECIPIENTS` — array of `{email, name}` objects
- `SMTP_USER` / `SMTP_PASS` — Yandex mail credentials (`SMTP_PASS` read from env var)
- `RECAPTCHA_SECRET` — Google reCAPTCHA v2 secret key (configured)
- `LEADS_FILE` — absolute path to CSV outside web root

**reCAPTCHA v2 site key** is set directly in `index.html` on both `.g-recaptcha` divs (`data-sitekey`).

**SMTP password** is read via `getenv('SMTP_PASS')` — set on the server via `~/.bashrc`.

## Deployment

Files are deployed directly to a TimeWeb server (Apache shared hosting). No CI/CD pipeline. Upload changed files via FTP/SSH or the TimeWeb panel.

- Site: `https://market.opalubka365.ru/`
- Web root: `/home/c/ck33033/market/public_html/`
- CSV: `/home/c/ck33033/market/leads/leads.csv`

The `new/` directory is a design-in-progress and is **not** the live page.

## Security — все меры реализованы

- SMTP password via env var (`getenv('SMTP_PASS')`)
- Email header injection stripped in `clean()`
- CORS locked to `https://market.opalubka365.ru`
- CSRF via Origin header check
- Honeypot field `name="website"` in both forms
- `leads.csv` moved outside web root
- Security headers in `backend/.htaccess`
- reCAPTCHA v2 ("Я не робот") in both forms — ключи настроены
