<?php
/**
 * CineVerse — send.php
 * ------------------------------------------------------------
 * Contact form endpoint.
 * Receives: { name, email, subject, message }
 * Returns : { "ok": true|false, "message": "..." }
 * Stores  : data/messages.json  (ignored by Git)
 */

declare(strict_types=1);

require __DIR__ . '/php/helpers.php';

require_post_method();

$data = read_json_body();

// Clean every field before touching storage
$name    = isset($data['name'])    ? clean_input($data['name'])    : '';
$email   = isset($data['email'])   ? clean_input($data['email'])   : '';
$subject = isset($data['subject']) ? clean_input($data['subject']) : '';
$message = isset($data['message']) ? clean_input($data['message']) : '';

// Server-side validation mirrors what JavaScript already checked
$errors = [];
if (mb_strlen($name) < 2)                              { $errors[] = 'name'; }
if (!is_valid_email($email))                           { $errors[] = 'email'; }
if (mb_strlen($subject) < 3)                           { $errors[] = 'subject'; }
if (mb_strlen($message) < 10)                          { $errors[] = 'message'; }

if ($errors) {
    json_response(false, 'Invalid fields: ' . implode(', ', $errors));
}

$saved = append_json_list(__DIR__ . '/data/messages.json', [
    'name'       => $name,
    'email'      => $email,
    'subject'    => $subject,
    'message'    => $message,
    'receivedAt' => date('c'),
]);

if (!$saved) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'Could not save the message.']);
    exit;
}

json_response(true, 'Message received.');
