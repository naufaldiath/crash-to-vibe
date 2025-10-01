# 🚀 Global Installation Guide

## Quick Global Installation

### Option 1: Install from Local Directory
```bash
# Navigate to the crash-analyzer directory
cd /Users/mekari/Documents/mekari/crash-analyzer

# Install globally
npm install -g .

# Now you can use it from anywhere!
generate-crash-analyzer
# or
crash-analyzer
```

### Option 2: Link for Development (Recommended)
```bash
# Navigate to the crash-analyzer directory
cd /Users/mekari/Documents/mekari/crash-analyzer

# Create a global symlink (great for development)
npm link

# Now you can use it from anywhere!
generate-crash-analyzer
# or
crash-analyzer
```

## Usage from Any Project

Once installed globally, navigate to any mobile project and run:

```bash
# Go to your mobile project
cd ~/projects/my-awesome-app

# Generate the workflow
generate-crash-analyzer

# The crashAnalyzer.md will be created in the current directory
```

## Examples

### Example 1: Android Project
```bash
$ cd ~/projects/my-android-app
$ generate-crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
✅ Detected android project
✅ Detected Firebase project: my-app-prod
✅ Detected project name: MyAndroidApp

📝 Please provide the following information:
Project directory path (/Users/dev/my-android-app): ✓
Project display name (MyAndroidApp): ✓
Platform (android/ios/flutter) (android): ✓
Firebase project ID (my-app-prod): ✓
Firebase app ID: 1:123456789:android:abc123def456
Kanban system (vibe/jira/github/linear) (vibe): ✓
Kanban project name (MyAndroidApp Mobile): ✓
Customize crash thresholds? (y/N) (N): ✓

✅ Configuration collected successfully!

📄 Generated workflow saved to: /Users/dev/my-android-app/crashAnalyzer.md
💾 Configuration saved to: /Users/dev/.crash-analyzer-config.json

🎉 Success! Your generic crash analyzer workflow has been generated.
```

### Example 2: iOS Project
```bash
$ cd ~/projects/my-ios-app
$ crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
✅ Detected ios project
✅ Detected Firebase project: ios-app-staging
✅ Detected project name: MyiOSApp

# ... interactive prompts ...

📄 Generated workflow saved to: /Users/dev/my-ios-app/crashAnalyzer.md
```

### Example 3: Flutter Project
```bash
$ cd ~/projects/my-flutter-app  
$ generate-crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
✅ Detected flutter project
✅ Detected Firebase project: flutter-app-prod
✅ Detected project name: MyFlutterApp

# ... interactive prompts ...

📄 Generated workflow saved to: /Users/dev/my-flutter-app/crashAnalyzer.md
```

## Configuration Storage

When installed globally, your configuration is saved to:
- **macOS/Linux**: `~/.crash-analyzer-config.json`
- **Windows**: `%USERPROFILE%\.crash-analyzer-config.json`

This allows the tool to remember your preferences across projects.

## Available Commands

After global installation, you have two commands:

```bash
# Primary command
generate-crash-analyzer

# Shorter alias
crash-analyzer
```

Both commands do exactly the same thing!

## Uninstalling

If you need to remove the global installation:

```bash
# If installed with npm install -g
npm uninstall -g firebase-crashlytics-kanban-generator

# If installed with npm link
npm unlink
```

## Updating

To update to a newer version:

```bash
# Navigate to the source directory
cd /Users/mekari/Documents/mekari/crash-analyzer

# Pull latest changes (if using git)
git pull

# Reinstall globally
npm install -g .
```

## Troubleshooting

### Permission Issues
```bash
# If you get permission errors, try:
sudo npm install -g .

# Or use a Node version manager like nvm
```

### Command Not Found
```bash
# Check if npm global bin is in your PATH
npm config get prefix

# Add to your shell profile (.zshrc, .bashrc, etc.):
export PATH="$(npm config get prefix)/bin:$PATH"
```

### Template Not Found
```bash
# Ensure the template file exists in the installed package
ls -la $(npm root -g)/firebase-crashlytics-kanban-generator/
```

## Benefits of Global Installation

✅ **Use from anywhere** - No need to copy scripts  
✅ **Always up-to-date** - Single installation to maintain  
✅ **Team consistency** - Everyone uses the same version  
✅ **Configuration persistence** - Settings saved in home directory  
✅ **Path independence** - Works regardless of project structure

Now you can generate crash analyzer workflows for any mobile project with a simple command! 🎯
