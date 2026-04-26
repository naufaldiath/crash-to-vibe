#!/usr/bin/env node
'use strict';

// Skip in CI / local (non-global) installs
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
  process.exit(0);
}

const { version } = require('./package.json');
const _title = `crash-to-vibe v${version} installed!`;
const _inner = 58;
const _lpad = Math.floor((_inner - _title.length) / 2);
const _rpad = _inner - _title.length - _lpad;
const _banner = `║${' '.repeat(_lpad)}${_title}${' '.repeat(_rpad)}║`;

const msg = `
╔══════════════════════════════════════════════════════════╗
${_banner}
╚══════════════════════════════════════════════════════════╝

Get started in your mobile project:

  cd /path/to/your/mobile/project
  crash-to-vibe

This installs the skill to Claude Code, Gemini, Codex, Copilot,
Cursor, Cline, Kiro, and more — then sets up your Jira config.

Then open your AI agent and say:
  "analyze my Firebase crashes and create Jira issues"

Run crash-to-vibe --help for all options.

`;

// Try writing to the controlling TTY first (most reliable),
// fall back to stderr. Wait for flush before exiting.
const fs = require('fs');
try {
  const tty = fs.openSync('/dev/tty', 'w');
  fs.writeSync(tty, msg);
  fs.closeSync(tty);
  process.exit(0);
} catch {
  process.stderr.write(msg, () => process.exit(0));
}
