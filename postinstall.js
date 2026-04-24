#!/usr/bin/env node
'use strict';

// Skip hint in CI environments
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.npm_config_global === 'false') {
  process.exit(0);
}

console.log(`
╔══════════════════════════════════════════════════════════╗
║           crash-to-vibe installed globally!              ║
╚══════════════════════════════════════════════════════════╝

To use the zero-config global skill (auto-installs to ~/.agents/skills/):

  1. Run once to install the global skill:
       crash-to-vibe --zero-config

  2. In each mobile project, create a crash-to-vibe.json:
       crash-to-vibe --init-project

  3. Open Claude Code (or Gemini CLI / Copilot) in your project and say:
       "analyze my Firebase crashes and create Jira issues"

The skill auto-activates — no manual file passing needed.

Full per-project setup (bakes in all config):
  crash-to-vibe

Run crash-to-vibe --help for all options.
`);

process.exit(0);
