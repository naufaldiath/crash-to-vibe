# Usage Examples

## Example 1: Multiple Environment Selection

```bash
$ generate-crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
� Searching for Firebase config files recursively...
📂 Found 0 google-services.json file(s)
📂 Found 2 GoogleService-Info.plist file(s)

🔥 Multiple Firebase configurations found:
1. [IOS] /Users/mekari/Documents/mekari/talenta-ios/Talenta/Firebase/Prod/GoogleService-Info.plist
   Environment: Production
2. [IOS] /Users/mekari/Documents/mekari/talenta-ios/Talenta/Firebase/Dev/GoogleService-Info.plist
   Environment: Development

Select configuration (1-2) (1): 1
✅ Selected ios config: /Users/mekari/Documents/mekari/talenta-ios/Talenta/Firebase/Prod/GoogleService-Info.plist
✅ Environment: Production
✅ Detected ios project
✅ Detected Firebase project: talenta-production
✅ Detected Firebase app: 1:123456789:ios:abcdef123456
✅ Detected project name: TalentaApp

📝 Please provide the following information:

Project directory path (/Users/mekari/Documents/mekari/talenta-ios): ✓
Project display name (TalentaApp): ✓
Platform (android/ios/flutter) (ios): ✓
Kanban system (vibe/jira/github/linear) (vibe): ✓
Kanban project name (TalentaApp Mobile): ✓
Customize crash thresholds? (y/N) (N): ✓

✅ Configuration collected successfully!

📄 Generated workflow saved to: /Users/mekari/Documents/mekari/talenta-ios/crashAnalyzer.md
💾 Configuration saved to: /Users/mekari/.crash-analyzer-config.json

🎉 Success! Your generic crash analyzer workflow has been generated.
```

## Example 2: Flutter Project with Both Platforms and Environments

```bash
$ generate-crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
📁 Searching for Firebase config files recursively...
📂 Found 2 google-services.json file(s)
📂 Found 2 GoogleService-Info.plist file(s)

🔥 Multiple Firebase configurations found:
1. [ANDROID] /Users/dev/flutter-app/android/app/src/prod/google-services.json
   Environment: Production
2. [ANDROID] /Users/dev/flutter-app/android/app/src/dev/google-services.json
   Environment: Development
3. [IOS] /Users/dev/flutter-app/ios/config/Prod/GoogleService-Info.plist
   Environment: Production
4. [IOS] /Users/dev/flutter-app/ios/config/Dev/GoogleService-Info.plist
   Environment: Development

Select configuration (1-4) (1): 1
✅ Selected android config: /Users/dev/flutter-app/android/app/src/prod/google-services.json
✅ Environment: Production

Both Android and iOS configs found. Is this a Flutter project? (y/N) (N): y
✅ Detected as Flutter project with multiple environments
✅ Detected Firebase project: flutter-app-prod
✅ Detected Firebase app: 1:987654321:android:flutter123
✅ Detected project name: MyFlutterApp

📝 Please provide the following information:

Project directory path (/Users/dev/flutter-app): ✓
Project display name (MyFlutterApp): ✓
Platform (android/ios/flutter) (flutter): ✓
Kanban system (vibe/jira/github/linear) (vibe): ✓
Kanban project name (MyFlutterApp Mobile): ✓
Customize crash thresholds? (y/N) (N): ✓

✅ Configuration collected successfully!
```

## Example 3: Single Configuration (Auto-Selected)

```bash
$ generate-crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
📁 Searching for Firebase config files recursively...
📂 Found 1 google-services.json file(s)
📂 Found 0 GoogleService-Info.plist file(s)
✅ Found android config at: /Users/dev/android-app/app/google-services.json
✅ Detected android project
✅ Detected Firebase project: android-app-production
✅ Detected Firebase app: 1:111222333:android:android123
✅ Detected project name: MyAndroidApp

📝 Please provide the following information:
# ... continues with normal flow
```

## Example 2: Firebase Project Selection (No Active Project)

```bash
$ generate-crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
🔍 Fetching Firebase project info from CLI...
⚠️  No active Firebase project found
✅ Detected ios project
✅ Detected project name: MyiOSApp

📝 Please provide the following information:

Project directory path (/Users/dev/my-ios-app): ✓
Project display name (MyiOSApp): ✓
Platform (android/ios/flutter) (ios): ✓

🔥 Firebase project not auto-detected. Let me help you find it...
📋 Fetching available Firebase projects...

📋 Available Firebase projects:
1. my-app-production (My Mobile App Production)
2. my-app-staging (My Mobile App Staging)
3. ios-app-prod (iOS App Production)

Select project (1-3) or enter project ID manually (1): 3

📱 Found ios apps in ios-app-prod:
1. 1:987654321:ios:xyz789abc123 (iOS App)
2. 1:111222333:ios:def456ghi789 (iOS App Beta)

Select app (1-2) or enter app ID manually (1): 1

Kanban system (vibe/jira/github/linear) (vibe): ✓
Kanban project name (MyiOSApp Mobile): ✓
Customize crash thresholds? (y/N) (N): ✓

✅ Configuration collected successfully!
```

## Example 3: Manual Configuration (Firebase CLI Not Available)

```bash
$ generate-crash-analyzer

🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator

🔍 Auto-detecting project configuration...
🔍 Fetching Firebase project info from CLI...
⚠️  Firebase CLI not available or not logged in
💡 Run "firebase login" and "firebase use <project-id>" to enable auto-detection
✅ Detected flutter project
✅ Detected project name: MyFlutterApp

📝 Please provide the following information:

Project directory path (/Users/dev/my-flutter-app): ✓
Project display name (MyFlutterApp): ✓
Platform (android/ios/flutter) (flutter): ✓

🔥 Firebase project not auto-detected. Let me help you find it...
⚠️  Could not fetch Firebase projects list
💡 Make sure you are logged in: firebase login

Firebase project ID: flutter-app-staging
Firebase app ID: 1:555666777:android:flutter123abc

Kanban system (vibe/jira/github/linear) (vibe): github
Kanban project name (MyFlutterApp Mobile): ✓
Customize crash thresholds? (y/N) (N): ✓

✅ Configuration collected successfully!
```

## Generated Configuration Files

### last-config.json (Example)
```json
{
  "project": {
    "directory": "/Users/dev/my-mobile-app",
    "name": "MyMobileApp", 
    "platform": "android"
  },
  "firebase": {
    "projectId": "my-app-production",
    "appId": "1:123456789:android:abcdef123456"
  },
  "kanban": {
    "system": "vibe",
    "projectName": "MyMobileApp Mobile"
  },
  "thresholds": {
    "critical": {
      "crashes": 800,
      "users": 600
    },
    "high": {
      "crashes": 400,
      "users": 300  
    },
    "medium": {
      "crashes": 100,
      "users": 50
    }
  },
  "aiAgents": [
    "claude",
    "aider",
    "gemini", 
    "amp"
  ]
}
```

## File Detection Examples

### Android Project Structure
```
my-android-app/
├── android/
│   └── app/
│       └── google-services.json    ← Detected here
├── package.json                    ← Project name from here
└── crashAnalyzer.md               ← Generated here
```

### iOS Project Structure  
```
my-ios-app/
├── ios/
│   └── Runner/
│       └── GoogleService-Info.plist  ← Detected here
├── pubspec.yaml                      ← Project name from here  
└── crashAnalyzer.md                 ← Generated here
```

### Flutter Project Structure
```
my-flutter-app/
├── android/app/google-services.json     ← Android config
├── ios/Runner/GoogleService-Info.plist  ← iOS config
├── pubspec.yaml                         ← Project name
└── crashAnalyzer.md                    ← Generated here
```
