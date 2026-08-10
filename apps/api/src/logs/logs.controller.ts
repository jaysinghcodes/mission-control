import { Controller, Get, Query } from '@nestjs/common';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * LogsController — REAL gateway log tail.
 *
 * Reads the newest /tmp/openclaw/openclaw-<date>.log (JSON-lines format with
 * _meta.logLevelName + message + time). Parse is defensive: non-JSON lines
 * pass through as raw text so the viewer never breaks on format drift.
 * Loopback-only API reading a local log file = same trust domain.
 */
@Controller('logs')
export class LogsController {
  @Get()
  list(@Query('lines') lines = '200') {
    const n = Math.min(Number(lines) || 200, 500);
    const logDir = '/tmp/openclaw';
    let file: string | null = null;
    try {
      const candidates = readdirSync(logDir)
        .filter((f) => f.startsWith('openclaw-') && f.endsWith('.log'))
        .map((f) => join(logDir, f))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
      file = candidates[0] ?? null;
    } catch {
      file = null;
    }

    if (!file) {
      return { logs: [], file: null, ts: Date.now() };
    }

    const raw = readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(-n);
    const logs = raw
      .map((line) => {
        try {
          const j = JSON.parse(line);
          const time = typeof j.time === 'string' ? j.time : '';
          const tm = time ? time.slice(11, 19) : '';
          const lvl = String(j._meta?.logLevelName ?? 'INFO');
          const msg = String(j.message ?? line);
          return { tm, lvl, msg: msg.slice(0, 300) };
        } catch {
          return { tm: '', lvl: 'INFO', msg: line.slice(0, 300) };
        }
      })
      .reverse(); // newest first

    return { logs, file, ts: Date.now() };
  }
}
