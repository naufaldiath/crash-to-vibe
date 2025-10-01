# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI tool that generates AI-powered Firebase Crashlytics to Vibe Kanban automation workflows. The tool:
- Auto-detects Firebase configuration files (google-services.json, GoogleService-Info.plist) recursively in projects
- Supports Android, iOS, and Flutter projects
- Generates workflow markdown files optimized for AI agent execution (Claude Code, Aider, Gemini CLI, Amp)
- Creates comprehensive crash analysis tasks with priority classification

## Key Commands

### Running the Generator
```bash
# Run locally during development
npm start
# or
npm run generate
# or
node generate-crash-analyzer.js

# When installed globally (via npm link or npm install -g)
crash-to-vibe
# or
generate-crash-analyzer
# or
crash-analyzer
```

### Global Installation for Development
```bash
# Create global symlink for testing
npm link

# Test globally
crash-analyzer

# Remove global link
npm unlink -g crash-to-vibe
```

### Firebase CLI Integration
The tool integrates with Firebase CLI for auto-detection:
```bash
# Login to Firebase (required for project listing)
firebase login

# Set active project (improves auto-detection)
firebase use <project-id>

# List available projects (used by tool internally)
firebase projects:list

# List apps for a project (used by tool internally)
firebase apps:list --project <project-id>
```

## Architecture

### Core Component: CrashAnalyzerGenerator Class

The tool is a single-file Node.js application ([generate-crash-analyzer.js](generate-crash-analyzer.js)) built around the `CrashAnalyzerGenerator` class with these key responsibilities:

1. **Project Detection** (`detectProjectInfo`, `findFirebaseConfigFiles`)
   - Recursively searches for Firebase config files up to 10 levels deep
   - Parses google-services.json (Android) and GoogleService-Info.plist (iOS)
   - Detects platform (android/ios/flutter) based on config presence
   - Extracts project name from package.json or pubspec.yaml
   - Supports multiple environments (Production, Development, Staging)

2. **Firebase Integration** (`getFirebaseInfoFromCLI`, `listFirebaseProjects`)
   - Queries Firebase CLI for active project and available apps
   - Falls back to manual entry if Firebase CLI unavailable
   - Parses Firebase CLI table output to extract project/app information

3. **User Interaction** (`collectConfiguration`, `promptUser`)
   - Interactive CLI prompts with intelligent defaults from auto-detection
   - Multi-environment selection when multiple configs found
   - App selection when multiple apps exist in Firebase project

4. **Workflow Generation** (`generateWorkflow`, `loadTemplate`)
   - Uses [crashAnalyzer.template.md](crashAnalyzer.template.md) as base template
   - Replaces placeholders like {{PROJECT_NAME}}, {{FIREBASE_PROJECT_ID}}, etc.
   - Generates AI-optimized task templates with acceptance criteria

5. **Output Management** (`saveWorkflow`, `saveConfig`)
   - Saves generated workflow to current directory as crashAnalyzer.md
   - Saves configuration to ~/.crash-analyzer-config.json (global) or ./last-config.json (local)

### Template System

The [crashAnalyzer.template.md](crashAnalyzer.template.md) contains:
- Step-by-step Firebase MCP integration instructions
- Crashlytics data fetching procedures (FATAL and NON-FATAL issues)
- Vibe Kanban task creation templates optimized for AI agents
- Priority classification system based on crash/user thresholds
- Platform-specific issue guidance (Android/iOS/Flutter)
- AI agent recommendations (Claude Code for analysis, Aider for refactoring, Gemini for performance, Amp for debugging)

### Configuration Schema

Configuration follows this structure (see [config.example.json](config.example.json)):
```javascript
{
  project: {
    directory: string,      // Absolute path to mobile project
    name: string,          // Display name for project
    platform: string       // 'android', 'ios', or 'flutter'
  },
  firebase: {
    projectId: string,     // Firebase project ID
    appId: string,        // Firebase app ID (format: 1:number:platform:hash)
    configFile: string,   // Path to selected config file
    environment: string   // Detected environment (Production, Development, etc.)
  },
  kanban: {
    system: 'vibe',       // Currently only Vibe Kanban supported
    projectName: string   // Kanban project name
  },
  thresholds: {
    critical: { crashes: number, users: number },
    high: { crashes: number, users: number },
    medium: { crashes: number, users: number }
  },
  aiAgents: ['claude', 'aider', 'gemini', 'amp']
}
```

## Key Patterns

### Multi-Environment Support
When multiple Firebase configs are found:
1. Tool lists all configs with detected environment names
2. User selects which configuration to use
3. Environment name extracted from path using keywords (prod, dev, staging, etc.)
4. Selected config and environment stored in output for reference

### Firebase Config Parsing
- **Android (google-services.json)**: JSON parsing for project_id, mobilesdk_app_id, project_number
- **iOS (GoogleService-Info.plist)**: Regex parsing XML for PROJECT_ID and GOOGLE_APP_ID keys
- **Flutter**: Detects when both Android and iOS configs present, prompts for platform confirmation

### Directory Traversal Safety
The `findFirebaseConfigFiles` method:
- Limits recursion to 10 levels to prevent infinite loops
- Skips common non-config directories (node_modules, .git, build, Pods, etc.)
- Handles permission errors gracefully with skip warnings
- Returns arrays of all found configs for user selection

### Environment Name Extraction
The `extractEnvironmentName` method uses pattern matching:
- Searches path segments for keywords: prod, dev, staging, test, qa, uat, demo, beta
- Normalizes names to proper case (Production, Development, Staging, etc.)
- Returns null if no environment detected (uses 'default')

## Testing the Tool

### Local Project Testing
```bash
cd /path/to/mobile-project
node /path/to/crash-analyzer/generate-crash-analyzer.js
```

### Global Installation Testing
```bash
npm link                    # Create global symlink
cd /path/to/mobile-project
crash-analyzer             # Run globally
npm unlink -g crash-to-vibe # Clean up
```

### Test Scenarios to Verify
1. Android project with single google-services.json
2. iOS project with single GoogleService-Info.plist
3. Flutter project with both configs
4. Project with multiple environments (prod/dev/staging)
5. Project without Firebase CLI installed
6. Project with Firebase CLI but no active project

## Common Modifications

### Adding New Platform Support
1. Update platform detection in `detectProjectInfo`
2. Add platform-specific config parsing method
3. Update template with platform-specific issue categories
4. Add platform to keyword list ('android', 'ios', 'flutter')

### Customizing Task Templates
Edit [crashAnalyzer.template.md](crashAnalyzer.template.md):
- Modify STEP 5 for task template structure
- Update STEP 6 for platform-specific issue templates
- Adjust priority thresholds in STEP 4
- Add/remove AI agent recommendations

### Changing Default Thresholds
Update in constructor:
```javascript
thresholds: {
  critical: { crashes: 800, users: 600 },
  high: { crashes: 400, users: 300 },
  medium: { crashes: 100, users: 50 }
}
```

### Adding New Placeholders
1. Add to `replacements` object in `generateWorkflow`
2. Update template to use `{{PLACEHOLDER_NAME}}`
3. Ensure value is set in config during `collectConfiguration`

## Dependencies

This is a pure Node.js tool with zero external dependencies:
- `fs`: File system operations (config reading, workflow writing)
- `path`: Path manipulation (cross-platform compatibility)
- `readline`: Interactive CLI prompts
- `child_process.execSync`: Firebase CLI integration
- Built-in JSON/string parsing for config files

## Output Files

### Generated Files
- `crashAnalyzer.md`: Main workflow file (saved to current working directory)
- `~/.crash-analyzer-config.json`: Global config (when installed globally)
- `last-config.json`: Local config (when run locally)

### File Locations
- **Global install**: Config saved to user home directory
- **Local run**: Config saved to script directory
- **Workflow**: Always saved to current working directory (process.cwd())

## AI Agent Integration

The generated workflow is optimized for four AI agents:
- **Claude Code**: Complex crash analysis, lifecycle issues, concurrency problems
- **Aider**: Code refactoring, file editing, bulk improvements
- **Gemini CLI**: Performance optimization, API compatibility analysis
- **Amp**: Collaborative debugging, comprehensive test suites

Each task template includes:
- AI agent recommendations with expected resolution time
- AI-executable action items with measurable criteria
- File paths and investigation targets for AI context
- Acceptance criteria verifiable by automated tools