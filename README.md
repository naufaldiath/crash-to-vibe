# 🔥 crash-to-vibe

**Firebase Crashlytics → Jira — Agent Skills Installer**

Installs an [Agent Skills](https://agentskills.io) skill that auto-activates Firebase Crashlytics crash analysis and Jira task creation in Claude Code, Gemini CLI, Codex, and GitHub Copilot. Run once, then just tell your AI agent "analyze my crashes."

## ✨ Features

- **🤖 AI Auto-Activation**: Skill auto-loads when you mention crashes or Crashlytics — no manual file passing
- **🌐 Cross-Client**: Works in Claude Code, Gemini CLI, Codex, Copilot, Cursor, Cline, Kiro, Antigravity, Amp, OpenCode (Agent Skills standard)
- **📱 Multi-Platform**: Android, iOS, Flutter
- **🎯 Jira Integration**: Creates prioritized issues via Atlassian MCP with real stacktraces
- **🔀 Bitbucket PRs** (optional): Auto-creates pull requests after AI fixes
- **⚙️ Configurable Thresholds**: CRITICAL / HIGH / MEDIUM / LOW crash priority classification
- **🌍 Zero-config global mode**: Install once, works across all projects via `crash-to-vibe.json`

## 🚀 Quick Start

```bash
# 1. Install globally
npm install -g crash-to-vibe

# 2. Run in your mobile project (installs global skill + creates crash-to-vibe.json)
cd /path/to/your/mobile/project
crash-to-vibe
```

That's it. Open Claude Code (or Gemini CLI, Copilot, Cursor, Codex…) in your project and say:

> "Analyze my Firebase crashes and create Jira issues"

The skill auto-activates — no extra setup needed.

## 📦 Installation Options

### From npm (recommended)

```bash
npm install -g crash-to-vibe
```

### From source

```bash
git clone https://github.com/naufaldiath/crash-to-vibe.git
cd crash-to-vibe
npm link
```

## 🎛️ CLI Flags

```
crash-to-vibe [options]

Default (no flags):
  Install global skill to all known CLI skill dirs, then offer to create
  crash-to-vibe.json in the current project.

  --init-project      Only create crash-to-vibe.json in current directory
  --configure         Per-project mode: bake Firebase + Jira config into skill
  --use-last-config   (with --configure) reuse last saved configuration
  --config <file>     (with --configure) load predefined team config file
  --force             Overwrite existing skill installations
  --dry-run           Preview files to be written without writing
  --help, -h          Show this help
```

### Examples

```bash
crash-to-vibe                           # Default: install global skill + init project
crash-to-vibe --init-project            # Only create crash-to-vibe.json here
crash-to-vibe --dry-run                 # Preview what would be installed
crash-to-vibe --force                   # Overwrite existing installations
crash-to-vibe --configure               # Per-project setup (bakes in config)
crash-to-vibe --configure --config team.json
```

## 📁 Installed Skill Structure

```
.agents/skills/crash-to-vibe/
├── SKILL.md                    # Workflow + auto-activation triggers
└── references/
    ├── task-templates.md       # CRITICAL/HIGH/MEDIUM/LOW Jira issue templates
    ├── platform-patterns.md    # Android/iOS/Flutter crash pattern guide
    └── pr-workflow.md          # Bitbucket PR workflow (only if Bitbucket configured)
```

## 📋 Prerequisites

### Required MCP Servers

Configure these in your AI IDE's MCP settings before using the skill.

#### Firebase MCP (required)

```json
{
  "servers": {
    "firebase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "experimental:mcp", "--only", "crashlytics,core"]
    }
  }
}
```

After adding: `firebase login` and `firebase use <project-id>`.

#### Atlassian MCP (required — for Jira)

```json
{
  "servers": {
    "atlassian-mcp-server": {
      "type": "http",
      "url": "https://mcp.atlassian.com/v1/sse"
    }
  }
}
```

Authenticate via the MCP server UI the first time.

#### Bitbucket MCP (optional — for PR automation)

```json
{
  "servers": {
    "bitbucket": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "bitbucket-mcp@latest"],
      "env": {
        "BITBUCKET_URL": "https://api.bitbucket.org/2.0",
        "BITBUCKET_WORKSPACE": "your-workspace",
        "BITBUCKET_USERNAME": "your-email@example.com",
        "BITBUCKET_PASSWORD": "your-app-password"
      }
    }
  }
}
```

Create an App Password at Bitbucket → Settings → Personal settings → App passwords.

### MCP Config Locations

| AI IDE | Config file |
|--------|-------------|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)<br>`%APPDATA%\Claude\claude_desktop_config.json` (Windows) |
| Cline / Windsurf / Cursor | `.vscode/mcp.json` or IDE settings |

## 🎯 Priority Classification

Issues are classified by crash volume over the ~8-day Crashlytics reporting window:

| Priority | Default threshold | Jira priority | Timeline |
|----------|------------------|---------------|----------|
| 🔥 CRITICAL | >800 crashes OR >600 users | Highest | This week |
| 🔥 HIGH | >400 crashes OR >300 users | High | This sprint |
| ⚡ MEDIUM | >100 crashes OR >50 users | Medium | Next sprint |
| 📊 LOW | below medium | Low | Monitoring |

Thresholds are configurable during setup or via config file.

## 📋 crash-to-vibe.json (Zero-config per-project file)

For the zero-config global skill, commit this file to each mobile project root:

```bash
crash-to-vibe --init-project    # interactive creation
```

Minimal `crash-to-vibe.json`:

```json
{
  "jira": {
    "cloudId": "your-company.atlassian.net",
    "projectKey": "PROJ",
    "issueType": "Bug",
    "labels": "crash-to-vibe"
  }
}
```

See `crash-to-vibe.example.json` for full reference including Bitbucket and custom thresholds.

## 🤝 Team Configuration (Per-project mode)

Share a `team-config.json` so teammates skip interactive prompts:

```json
{
  "project": {
    "directory": "/path/to/your-mobile-project",
    "name": "your-mobile-app",
    "platform": "android"
  },
  "firebase": {
    "projectId": "your-firebase-project",
    "appId": "1:123456789:android:abcdef123456"
  },
  "jira": {
    "cloudId": "your-company.atlassian.net",
    "projectKey": "PROJ",
    "issueType": "Bug",
    "labels": "crash-to-vibe"
  },
  "bitbucket": {
    "workspace": "your-workspace",
    "repoSlug": "your-repo-slug",
    "targetBranch": "develop",
    "reviewers": []
  },
  "thresholds": {
    "critical": { "crashes": 800, "users": 600 },
    "high":     { "crashes": 400, "users": 300 },
    "medium":   { "crashes": 100, "users": 50 }
  }
}
```

Commit `team-config.json` to your repo. Team members run:

```bash
crash-to-vibe --config team-config.json
```

See `team-config.example.json` for a full reference.

## 📱 Platform Support

| Platform | Config file detected | Notes |
|----------|---------------------|-------|
| Android | `google-services.json` | Parsed automatically |
| iOS | `GoogleService-Info.plist` | Parsed automatically |
| Flutter | Both files | Prompted to confirm Flutter |

## 🔧 Troubleshooting

### Firebase CLI not found

```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
```

### Skill already installed

```bash
crash-to-vibe --force          # overwrite
crash-to-vibe --dry-run        # preview first
```

### No Firebase config files found

- Confirm `google-services.json` or `GoogleService-Info.plist` exists in your project tree
- The tool searches up to 10 directory levels deep, skipping `node_modules`, `.git`, `build`, `Pods`

## 📝 Output Files

| File | Location | Purpose |
|------|----------|---------|
| `.agents/skills/crash-to-vibe/` | `process.cwd()` | Installed skill (default) |
| `~/.agents/skills/crash-to-vibe/` | Home dir | Global install (`--global`) |
| `~/.crash-analyzer-config.json` | Home dir | Saved config (global install) |
| `last-config.json` | Script dir | Saved config (local run) |

## 🗑️ Uninstall

```bash
# Uninstall CLI
npm uninstall -g crash-to-vibe

# Remove installed skill
rm -rf .agents/skills/crash-to-vibe          # local
rm -rf ~/.agents/skills/crash-to-vibe        # global
```

## 📄 License

MIT

---

**Made with ❤️ for mobile developers who want AI-powered crash analysis**
