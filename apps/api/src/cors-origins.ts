/**
 * CORS allowlist for Mission Control.
 *
 * The API binds to loopback only and is reached through an SSH tunnel, so the
 * browser can legitimately present EITHER localhost spelling as the page
 * origin (http://localhost:5173 or http://127.0.0.1:5173). Locking to a
 * single spelling makes the Connect gate fail in the browser while curl works
 * (curl ignores CORS) — exactly the bug seen on 2026-08-31.
 *
 * WEB_ORIGIN may override with a comma-separated list (e.g. a deployed
 * origin). Never a wildcard: the dashboard is the only allowed consumer.
 */
const DEFAULT_WEB_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function webOrigins(): string[] {
  const raw = process.env.WEB_ORIGIN?.trim();
  if (!raw) return DEFAULT_WEB_ORIGINS;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
