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
  config.php        ← All site settings: SMTP credentials, recipients, file paths
  submit.php        ← Single form handler: sanitize → validate → rate-limit → CSV → email
  .htaccess         ← Blocks direct access to config.php and leads.csv
css/style.css       ← Styles for main index.html
js/script.js        ← All frontend logic for main index.html
new/css/, new/js/   ← Styles and scripts for the new/ design version
img/                ← Static images
```

### Form submission flow

1. `js/script.js` validates client-side (phone mask, required fields), then POSTs to `/backend/submit.php`
2. `submit.php` sanitizes input → validates → checks IP-based rate limit (5/hour, stored in `/tmp`) → appends to `leads.csv` → sends HTML email via Yandex SMTP to all `MAIL_RECIPIENTS`
3. Returns `{"ok": true}` or `{"ok": false, "error": "..."}` as JSON

### Two form instances

Both forms on `index.html` (main contact form and modal) post to the same endpoint. The `source` field (`main` | `modal`) distinguishes them in the CSV and email.

## Configuration

All runtime settings live in `backend/config.php`:
- `MAIL_RECIPIENTS` — array of `{email, name}` objects
- `SMTP_USER` / `SMTP_PASS` — Yandex mail credentials (use app password if 2FA enabled)
- `LEADS_FILE` — absolute path to the CSV file

**The SMTP password is currently a placeholder** (`ВСТАВЬТЕ_ПАРОЛЬ_ЗДЕСЬ`). The migration plan is to read it from an environment variable: `getenv('SMTP_PASS')`.

## Deployment

Files are deployed directly to a TimeWeb server (Apache shared hosting). No CI/CD pipeline. Upload changed files via FTP/SSH or the TimeWeb panel.

The `new/` directory is a design-in-progress and is **not** the live page.

## Known Pending Security Work

See the conversation history for the full security hardening plan. Key items not yet implemented:
- CSRF token on both forms
- Honeypot field replacing `/tmp` rate limiting
- CORS locked to production domain (currently `*`)
- `\r\n` stripping on `$name` to prevent email header injection
- Security headers in `.htaccess` (CSP, X-Frame-Options, etc.)
- SMTP password moved to server environment variable
- `leads.csv` moved outside the web root
