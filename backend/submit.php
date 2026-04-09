<?php
// ════════════════════════════════════════════
//  Обработчик форм — Статика-С
// ════════════════════════════════════════════

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

// ── Принимаем только POST ────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ── Читаем и чистим данные ───────────────────
function clean(string $v): string {
    return htmlspecialchars(trim(strip_tags($v)), ENT_QUOTES, 'UTF-8');
}

$name    = clean($_POST['name']    ?? '');
$phone   = clean($_POST['phone']   ?? '');
$comment = clean($_POST['comment'] ?? '');
$source  = clean($_POST['source']  ?? 'main');

// ── Валидация ────────────────────────────────
if ($name === '' || $phone === '') {
    echo json_encode(['ok' => false, 'error' => 'Заполните обязательные поля.']);
    exit;
}

// Простая проверка телефона: минимум 10 цифр
if (mb_strlen(preg_replace('/\D/', '', $phone), 'UTF-8') < 10) {
    echo json_encode(['ok' => false, 'error' => 'Введите корректный номер телефона.']);
    exit;
}

// ── Защита от спама: рейт-лимит по IP (5 заявок в час) ──
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/staticac_rate_' . md5($ip) . '.json';
$now      = time();
$limit    = 5;
$window   = 3600; // 1 час

$rate = [];
if (file_exists($rateFile)) {
    $rate = json_decode(file_get_contents($rateFile), true) ?? [];
}
$rate = array_filter($rate, fn($t) => ($now - $t) < $window);
if (count($rate) >= $limit) {
    echo json_encode(['ok' => false, 'error' => 'Слишком много попыток. Попробуйте через час.']);
    exit;
}
$rate[] = $now;
file_put_contents($rateFile, json_encode(array_values($rate)));

// ── Сохранение в CSV ─────────────────────────
function saveToCsv(string $file, array $row): void {
    $isNew = !file_exists($file);
    $fh    = fopen($file, 'a');
    if (!$fh) return;

    if ($isNew) {
        fputcsv($fh, ['Дата', 'Время', 'Имя', 'Телефон', 'Комментарий', 'Источник', 'IP']);
    }
    fputcsv($fh, $row);
    fclose($fh);
}

$dateTime = new DateTime('now', new DateTimeZone('Europe/Moscow'));
saveToCsv(LEADS_FILE, [
    $dateTime->format('d.m.Y'),
    $dateTime->format('H:i:s'),
    $name,
    $phone,
    $comment,
    $source === 'modal' ? 'Модальная форма' : 'Основная форма',
    $ip,
]);

// ── Отправка email ───────────────────────────
$sourceLabel = $source === 'modal' ? 'Модальная форма' : 'Основная форма';
$dateStr     = $dateTime->format('d.m.Y H:i') . ' МСК';

$subject = "Новая заявка с сайта — {$name}";
$body    = <<<HTML
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;
              box-shadow:0 2px 8px rgba(0,0,0,.1);overflow:hidden;">
    <div style="background:#1a1a1a;padding:20px 24px;">
      <h2 style="margin:0;color:#f4ad3a;font-size:18px;">Новая заявка — Статика-С</h2>
      <p style="margin:4px 0 0;color:#aaa;font-size:13px;">{$dateStr}</p>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#888;font-size:13px;width:120px;">Имя</td>
          <td style="padding:8px 0;font-size:15px;font-weight:bold;">{$name}</td>
        </tr>
        <tr style="border-top:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#888;font-size:13px;">Телефон</td>
          <td style="padding:8px 0;font-size:15px;font-weight:bold;">
            <a href="tel:{$phone}" style="color:#1a1a1a;text-decoration:none;">{$phone}</a>
          </td>
        </tr>
        <tr style="border-top:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#888;font-size:13px;">Комментарий</td>
          <td style="padding:8px 0;font-size:14px;">{$comment}</td>
        </tr>
        <tr style="border-top:1px solid #f0f0f0;">
          <td style="padding:8px 0;color:#888;font-size:13px;">Источник</td>
          <td style="padding:8px 0;font-size:13px;color:#666;">{$sourceLabel}</td>
        </tr>
      </table>
      <div style="margin-top:20px;padding:12px;background:#fff8ec;border-radius:6px;
                  border-left:3px solid #f4ad3a;">
        <a href="tel:{$phone}" style="display:inline-block;background:#f4ad3a;color:#1a1a1a;
           text-decoration:none;padding:10px 20px;border-radius:5px;font-weight:bold;
           font-size:14px;">Позвонить: {$phone}</a>
      </div>
    </div>
    <div style="padding:12px 24px;background:#f9f9f9;font-size:12px;color:#aaa;">
      Заявка с сайта Статика-С &nbsp;|&nbsp; IP: {$ip}
    </div>
  </div>
</body>
</html>
HTML;

$mailResult = smtpSend(
    SMTP_HOST, SMTP_PORT,
    SMTP_USER, SMTP_PASS,
    MAIL_FROM, MAIL_FROM_NAME,
    MAIL_TO,   MAIL_TO_NAME,
    $subject,  $body
);

if (!$mailResult['ok']) {
    // Заявка сохранена в CSV, но письмо не ушло — логируем ошибку
    error_log('[Статика-С] Ошибка SMTP: ' . $mailResult['error']);
    // Не возвращаем ошибку пользователю — данные уже в CSV
}

echo json_encode(['ok' => true]);
exit;


// ════════════════════════════════════════════
//  Минимальный SMTP-клиент (без зависимостей)
// ════════════════════════════════════════════
function smtpSend(
    string $host, int $port,
    string $user, string $pass,
    string $from, string $fromName,
    string $to,   string $toName,
    string $subject, string $body
): array {
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);

    $socket = @stream_socket_client(
        "ssl://{$host}:{$port}", $errno, $errstr, 30,
        STREAM_CLIENT_CONNECT, $ctx
    );

    if (!$socket) {
        return ['ok' => false, 'error' => "Соединение: {$errstr} ({$errno})"];
    }

    stream_set_timeout($socket, 15);

    $read = function () use ($socket): string {
        $data = '';
        while ($line = fgets($socket, 512)) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $data;
    };

    $write = function (string $cmd) use ($socket): void {
        fputs($socket, $cmd . "\r\n");
    };

    $enc = fn(string $s): string => '=?UTF-8?B?' . base64_encode($s) . '?=';

    // SMTP-диалог
    $read(); // 220 greeting

    $write("EHLO localhost");
    $read();

    $write("AUTH LOGIN");
    $read();

    $write(base64_encode($user));
    $read();

    $write(base64_encode($pass));
    $resp = $read();

    if (!str_starts_with(trim($resp), '235')) {
        fclose($socket);
        return ['ok' => false, 'error' => 'Авторизация SMTP: ' . trim($resp)];
    }

    $write("MAIL FROM:<{$from}>");
    $read();

    $write("RCPT TO:<{$to}>");
    $resp = $read();
    if (!str_starts_with(trim($resp), '250')) {
        fclose($socket);
        return ['ok' => false, 'error' => 'RCPT TO: ' . trim($resp)];
    }

    $write("DATA");
    $read();

    $headers  = "From: {$enc($fromName)} <{$from}>\r\n";
    $headers .= "To: {$enc($toName)} <{$to}>\r\n";
    $headers .= "Subject: {$enc($subject)}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: StaticaS-PHP\r\n";

    // Экранируем строки, начинающиеся с точки (RFC 5321)
    $body = preg_replace('/^\.$/m', '..', $body);

    $write($headers . "\r\n" . $body . "\r\n.");
    $resp = $read();

    $write("QUIT");
    fclose($socket);

    if (!str_starts_with(trim($resp), '250')) {
        return ['ok' => false, 'error' => 'DATA: ' . trim($resp)];
    }

    return ['ok' => true];
}
