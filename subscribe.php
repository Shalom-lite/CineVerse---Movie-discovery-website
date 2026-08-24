<?php
/**
 * CineVerse — subscribe.php
 * ------------------------------------------------------------
 * Newsletter signup endpoint.
 * Receives: { "email": "visitor@example.com" }
 * Returns : { "ok": true|false, "message": "..." }
 * Stores  : data/subscribers.json  (ignored by Git)
 */

declare(strict_types=1);

require __DIR__ . '/php/helpers.php';

require_post_method();

$data  = read_json_body();
$email = isset($data['email']) ? clean_input($data['email']) : '';

if (!is_valid_email($email)) {
    json_response(false, 'Please provide a valid email address.');
}

$saved = append_json_list(__DIR__ . '/data/subscribers.json', [
    'email'        => $email,
    'subscribedAt' => date('c'), // ISO-8601 timestamp
]);

if (!$saved) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'Could not save the subscription.']);
    exit;
}

json_response(true, 'Subscription saved.');
