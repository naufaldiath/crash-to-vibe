#!/usr/bin/env node
'use strict';

// Skip in CI / local installs
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.npm_config_global === 'false') {
  process.exit(0);
}

// Write to stderr — npm always shows stderr regardless of log level
process.stderr.write(`
╔══════════════════════════════════════════════════════════╗
║           crash-to-vibe installed!                       ║
╚══════════════════════════════════════════════════════════╝

Get started in your mobile project:

  cd /path/to/your/mobile/project
  crash-to-vibe

This will:
  1. Install the skill to all AI CLI tools on your machine
     (Claude Code, Gemini, Codex, Copilot, Cursor, Cline, and more)
  2. Create crash-to-vibe.json for this project (Jira config)

Then open your AI agent and say:
  "analyze my Firebase crashes and create Jira issues"

Run crash-to-vibe --help for all options.

`);

process.exit(0);
