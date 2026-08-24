<?php
/**
 * CineVerse — php/helpers.php
 * ------------------------------------------------------------
 * Small shared utilities used by subscribe.php and send.php:
 * input cleaning, validation and JSON-file storage.
 *
 * The site does NOT depend on this file to browse movies —
 * it only powers the two forms.
 */

declare(strict_types=1);

/**
 * Make raw user input safe to store/display:
 * trim whitespace, remove slashes, escape HTML characters.
 */
function clean_input($value): string
{
    $value = trim((string) $value);
    $value = stripslashes($value);
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/** True when the string looks like a real email address. */
function is_valid_email(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Read a JSON file that contains a list (array).
 * Returns an empty array when missing or corrupted.
 */
function read_json_list(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $handle = fopen($path, 'r');
    if ($handle === false) {
        return [];
    }

    flock($handle, LOCK_SH);
    $raw   = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Append one entry to a JSON list file.
 * Uses an exclusive lock so parallel submissions never corrupt data.
 */
function append_json_list(string $path, array $entry): bool
{
    $list  = read_json_list($path);
    $list[] = $entry;

    $handle = fopen($path, 'c+');
    if ($handle === false) {
        return false;
    }

    flock($handle, LOCK_EX);
    ftruncate($handle, 0);
    fwrite($handle, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    return true;
}

/** Send a JSON answer back to the browser and stop. */
function json_response(bool $ok, string $message = ''): void
{
    http_response_code($ok ? 200 : 422);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

/** Only allow POST requests; everything else gets a 405. */
function require_post_method(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
        exit;
    }
}

/**
 * Read the request body as JSON.
 * app.js posts JSON strings, so we decode php://input;
 * $_POST is used as a fallback for classic form posts.
 */
function read_json_body(): array
{
    $raw  = file_get_contents('php://input');
    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : $_POST;
}
