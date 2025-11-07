# 🔥 crash-to-vibe

**Firebase Crashlytics to Vibe Kanban - AI-Powered Workflow Generator**

A powerful CLI tool that automatically generates AI-optimized workflows for converting Firebase Crashlytics crash data into actionable Vibe Kanban tasks. Built for mobile developers working with Android, iOS, and Flutter projects.

## ✨ Features

- **🔍 Smart Auto-Detection**: Recursively discovers Firebase configuration files
- **🌍 Multi-Environment Support**: Handles multiple environments (Production, Development, Staging)
- **📱 Platform Support**: Works with Android, iOS, and Flutter projects
- **🤖 AI CLI Execution**: Direct integration with Claude Code, Copilot, Gemini, and Codex
- **🔥 Firebase CLI Integration**: Automatically fetches project and app information
- **⚙️ Customizable Thresholds**: Configure crash/user thresholds for priority classification
- **🏷️ Jira Labels Support**: Configure default labels for Jira tickets (default: `crash-to-vibe`)
- **📋 Comprehensive Tasks**: Creates detailed Kanban tasks with acceptance criteria
- **🚀 Multiple Execution Modes**: Generate-only or auto-execute with AI CLI

## 🚀 Quick Start

### Installation

#### Option 1: Install from npm (Recommended)

```bash
# Install globally from npm
npm install -g crash-to-vibe
```

#### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/naufaldiath/crash-to-vibe.git
cd crash-to-vibe

# Install dependencies
npm install

# Create global symlink for easy access
npm link
```

### Verify Installation

```bash
# Check if installed correctly
crash-to-vibe --help
```

### Usage

#### Interactive Mode (Recommended)
```bash
# Navigate to your mobile project
cd /path/to/your/mobile/project

# Run the generator - will auto-detect AI CLIs
crash-to-vibe
```

#### Generate Only Mode
```bash
# Just generate the workflow file without AI execution
crash-to-vibe --generate-only
```

#### Force Specific AI CLI
```bash
# Execute with Codex CLI
crash-to-vibe --cli codex

# Execute with Gemini CLI
crash-to-vibe --cli gemini

# Execute with GitHub Copilot
crash-to-vibe --cli copilot
```
```

#### Show Help
```bash
crash-to-vibe --help
```

## 📋 Prerequisites

### System Requirements
- **Node.js**: v14.0.0 or higher
- **Firebase Project**: An active Firebase project with Crashlytics enabled
- **Firebase CLI** (recommended): For enhanced auto-detection
- **Task Management System**: Vibe Kanban or Jira (Atlassian) account
- **AI CLI** (optional): One or more of the supported AI CLIs for auto-execution

### Required MCP Servers

Before using crash-to-vibe with AI execution, you need to install and configure the required MCP servers in your AI IDE's configuration file (e.g., `mcp.json` for Claude Desktop, Cline, or Windsurf).

#### 1. Firebase MCP (Required)
For fetching crash data from Firebase Crashlytics:

```json
{
  "servers": {
    "firebase": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "firebase-tools@latest",
        "experimental:mcp",
        "--only",
        "crashlytics,core"
      ]
    }
  }
}
```

**Setup**: 
- Requires Firebase CLI authentication: `firebase login`
- Set active project: `firebase use <project-id>`

#### 2. Task Management MCP (Choose One)

**Option A: Vibe Kanban MCP**
```json
{
  "servers": {
    "vibe_kanban": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "vibe-kanban",
        "--mcp"
      ]
    }
  }
}
```

**Option B: Atlassian MCP (Jira)**
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

**Setup**: Requires Atlassian account authentication via the MCP server UI.

#### 3. Bitbucket MCP (Optional - for PR automation)
For automated pull request creation after AI fixes:

```json
{
  "servers": {
    "bitbucket": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "bitbucket-mcp@latest"
      ],
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

**Setup**: 
- Create Bitbucket App Password: Settings → Personal Bitbucket settings → App passwords
- Replace `your-workspace`, `your-email@example.com`, and `your-app-password`

#### Complete MCP Configuration Example

Here's a complete `mcp.json` with all required servers:

```json
{
  "servers": {
    "firebase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "experimental:mcp", "--only", "crashlytics,core"]
    },
    "vibe_kanban": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "vibe-kanban", "--mcp"]
    },
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

#### MCP Configuration Locations

| AI IDE | Configuration File Location |
|--------|----------------------------|
| **Claude Desktop** | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)<br>`%APPDATA%\Claude\claude_desktop_config.json` (Windows) |
| **Cline** | `.vscode/mcp.json` or workspace settings |
| **Windsurf** | `.windsurf/mcp.json` or IDE settings |
| **Cursor** | `.cursor/mcp.json` or IDE settings |

#### Verification

After configuring MCP servers:

1. **Restart your AI IDE**
2. **Check MCP status** in the IDE's MCP panel/settings
3. **Test Firebase MCP**: Ask AI to "list Firebase projects"
4. **Test Vibe/Jira MCP**: Ask AI to "list Vibe projects" or "list Jira projects"
5. **Test Bitbucket MCP** (if configured): Ask AI to "list Bitbucket repositories"

### Supported AI CLIs

| AI CLI | Installation | Authentication | Execution Mode |
|--------|--------------|----------------|----------------|
| **Claude Code** | [Download](https://claude.ai/download) | `claude auth login` | Autonomous (non-interactive) |
| **GitHub Copilot CLI** | `npm install -g @github/copilot` | Set `GH_TOKEN` env var | Autonomous (safety-restricted) |
| **Gemini CLI** | `npm install -g @google/gemini-cli` | `gemini auth login` | Autonomous (auto-approve) |
| **Codex CLI** | `npm install -g @openai/codex` or `brew install codex` | Sign in with ChatGPT or set `OPENAI_API_KEY` | Autonomous (exec mode) |

## 🔧 How It Works

1. **Project Detection**: Automatically scans for Firebase configuration files
2. **Configuration Collection**: Interactive prompts for project setup
3. **AI CLI Detection**: Checks for installed and authenticated AI CLIs
4. **Execution Mode Selection**: Choose generate-only or execute with AI CLI
5. **Workflow Generation**: Creates comprehensive markdown workflow
6. **AI Execution** (optional): Automatically runs workflow with selected AI CLI
7. **Logging**: Saves execution logs to `crashAnalyzer.execution.log`

## 🎯 Priority Classification

| Priority | Threshold | Timeline | AI Agent |
|----------|-----------|----------|----------|
| 🔥 **CRITICAL** | >800 crashes OR >600 users | This week | Claude Code |
| ⚠️ **HIGH** | >400 crashes OR >300 users | This sprint | Codex |
| 🔶 **MEDIUM** | >100 crashes OR >50 users | Next sprint | Gemini CLI |
| 📊 **LOW** | <100 crashes | Backlog | Setup Script |

## 📱 Platform Support

| Platform | Config File | Auto-Detection |
|----------|-------------|---------------|
| Android | `google-services.json` | ✅ |
| iOS | `GoogleService-Info.plist` | ✅ |
| Flutter | Both files | ✅ |

## 🛠️ Development

```bash
# Clone and set up
git clone https://github.com/naufaldiath/crash-to-vibe.git
cd crash-to-vibe
npm link

# Test
crash-to-vibe --help
```

## 🔧 Troubleshooting

### Firebase CLI Not Found
```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
```

### No Firebase Config Files Found
- Ensure config files exist in project root or subdirectories
- Check file permissions (readable)

### AI CLI Not Detected
If your AI CLI is installed but not detected:

1. **Claude Code**: Make sure `claude` command is in PATH
2. **GitHub Copilot CLI**: Install globally `npm install -g @github/copilot` and set token
3. **Gemini CLI**: Verify global installation `npm list -g @google/generative-ai-cli`
4. **Codex CLI**: Check installation `which codex` and authenticate

### Authentication Issues
```bash
# Claude Code
claude auth login

# GitHub Copilot CLI
export GH_TOKEN=your-github-token-here
# Generate at: https://github.com/settings/personal-access-tokens/new
# Enable "Copilot Requests" permission
# Note: Executes autonomously with safety restrictions (denies rm, git push)

# Gemini CLI
gemini auth login

# Codex CLI (sign in with ChatGPT or set API key)
codex  # Interactive sign-in
# or
export OPENAI_API_KEY=your-key-here
```

### Execution Failed
Check the execution log for details:
```bash
cat crashAnalyzer.execution.log
```

## 🎯 Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | Generation failed |
| `2` | Execution failed |

## 📝 Output Files

| File | Description |
|------|-------------|
| `crashAnalyzer.md` | Generated workflow file |
| `crashAnalyzer.execution.log` | AI CLI execution log |
| `~/.crash-analyzer-config.json` | Saved configuration (global install) |
| `last-config.json` | Saved configuration (local run) |

## �️ Uninstallation

### If installed from npm
```bash
npm uninstall -g crash-to-vibe
```

### If installed from source (npm link)
```bash
# Remove the global symlink
npm unlink -g crash-to-vibe

# Or from the project directory
cd crash-to-vibe
npm unlink
```

## �📄 License

MIT License

---

**Made with ❤️ for mobile developers who want AI-powered crash analysis**
