#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { AIExecutorFactory } = require('./ai-executors');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class CrashAnalyzerGenerator {
  constructor() {
    this.config = {
      project: {},
      firebase: {},
      kanban: {},
      jira: {},
      bitbucket: {},
      execution: {
        mode: 'generate-only', // 'generate-only' or 'cli'
        cli: null // 'claude', 'copilot', 'gemini', 'codex'
      },
      thresholds: {
        critical: { crashes: 800, users: 600 },
        high: { crashes: 400, users: 300 },
        medium: { crashes: 100, users: 50 }
      },
      aiAgents: ['claude', 'codex', 'gemini', 'amp']
    };
    this.aiExecutorFactory = new AIExecutorFactory();
    this.cliArgs = this.parseCliArgs();
  }

  /**
   * Parse command line arguments
   * @returns {object}
   */
  parseCliArgs() {
    const args = process.argv.slice(2);
    const parsed = {
      generateOnly: false,
      forceCli: null,
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--generate-only') {
        parsed.generateOnly = true;
      } else if (args[i] === '--cli' && args[i + 1]) {
        parsed.forceCli = args[i + 1];
        i++; // Skip next arg
      } else if (args[i] === '--help' || args[i] === '-h') {
        parsed.help = true;
      }
    }

    return parsed;
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log(`
🔥 Firebase Crashlytics to Task Management Workflow Generator

Usage: crash-to-vibe [options]

Options:
  --generate-only     Only generate the workflow file without executing
  --cli <name>        Execute with specific AI CLI (claude, copilot, gemini, codex)
  --help, -h          Show this help message

Examples:
  crash-to-vibe                      # Interactive mode with AI CLI detection
  crash-to-vibe --generate-only      # Only generate workflow file
  crash-to-vibe --cli claude         # Generate and execute with Claude Code
  crash-to-vibe --cli codex          # Generate and execute with Codex CLI

Supported Task Management Systems:
  - Vibe Kanban (via MCP)
  - Jira (via Atlassian MCP)

Supported AI CLIs:
  - Claude Code (claude)
  - GitHub Copilot CLI (copilot)
  - Gemini CLI (gemini)
  - Codex CLI (codex)
`);
  }

  async detectProjectInfo(projectDir = process.cwd()) {
    const detectedInfo = {
      directory: projectDir,
      platform: null,
      name: null,
      firebase: {}
    };

    // Recursively search for Firebase config files
    const firebaseFiles = this.findFirebaseConfigFiles(projectDir);
    
    console.log(`📂 Found ${firebaseFiles.googleServices.length} google-services.json file(s)`);
    console.log(`📂 Found ${firebaseFiles.googleServicesPlist.length} GoogleService-Info.plist file(s)`);
    
    // Handle multiple config files - let user choose
    let selectedConfigFile = null;
    let selectedPlatform = null;
    
    if (firebaseFiles.googleServices.length > 0 || firebaseFiles.googleServicesPlist.length > 0) {
      const allConfigs = [
        ...firebaseFiles.googleServices.map(file => ({ file, type: 'android', platform: 'android' })),
        ...firebaseFiles.googleServicesPlist.map(file => ({ file, type: 'ios', platform: 'ios' }))
      ];
      
      if (allConfigs.length === 1) {
        // Only one config found, use it automatically
        selectedConfigFile = allConfigs[0];
        selectedPlatform = allConfigs[0].platform;
        console.log(`✅ Found ${selectedConfigFile.type} config at: ${selectedConfigFile.file}`);
      } else {
        // Multiple configs found, let user choose
        selectedConfigFile = await this.selectFirebaseConfig(allConfigs);
        selectedPlatform = selectedConfigFile.platform;
      }
      
      // Parse the selected config
      if (selectedConfigFile.type === 'android') {
        detectedInfo.platform = selectedPlatform;
        detectedInfo.firebase = this.parseGoogleServices(selectedConfigFile.file);
      } else if (selectedConfigFile.type === 'ios') {
        detectedInfo.platform = selectedPlatform;
        detectedInfo.firebase = this.parseGoogleServicesPlist(selectedConfigFile.file);
      }
      
      // Store selected config file path and environment for reference
      detectedInfo.firebase.configFile = selectedConfigFile.file;
      detectedInfo.firebase.environment = this.extractEnvironmentName(selectedConfigFile.file) || 'default';
    }

    // If both Android and iOS configs exist, it might be Flutter
    if (firebaseFiles.googleServices.length > 0 && firebaseFiles.googleServicesPlist.length > 0) {
      const isFlutter = await this.promptUser(
        'Both Android and iOS configs found. Is this a Flutter project? (y/N)', 
        'N'
      );
      if (isFlutter.toLowerCase() === 'y') {
        detectedInfo.platform = 'flutter';
        console.log('✅ Detected as Flutter project with multiple environments');
      }
    }

    // Try to get Firebase info from CLI if config files don't have everything
    if (!detectedInfo.firebase.projectId || !detectedInfo.firebase.appId) {
      const firebaseCliInfo = await this.getFirebaseInfoFromCLI(projectDir);
      detectedInfo.firebase = { ...detectedInfo.firebase, ...firebaseCliInfo };
    }

    // Detect project name
    if (fs.existsSync(path.join(projectDir, 'package.json'))) {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
      detectedInfo.name = packageJson.name || packageJson.displayName;
    } else if (fs.existsSync(path.join(projectDir, 'pubspec.yaml'))) {
      const pubspec = fs.readFileSync(path.join(projectDir, 'pubspec.yaml'), 'utf8');
      const nameMatch = pubspec.match(/^name:\s*(.+)$/m);
      if (nameMatch) detectedInfo.name = nameMatch[1].trim();
    }

    return detectedInfo;
  }

  findFirebaseConfigFiles(dir, maxDepth = 10, currentDepth = 0) {
    const result = {
      googleServices: [],
      googleServicesPlist: []
    };

    // Prevent infinite recursion and limit search depth
    if (currentDepth >= maxDepth) {
      return result;
    }

    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isFile()) {
          // Check for Firebase config files
          if (item.name === 'google-services.json') {
            result.googleServices.push(fullPath);
          } else if (item.name === 'GoogleService-Info.plist') {
            result.googleServicesPlist.push(fullPath);
          }
        } else if (item.isDirectory()) {
          // Skip common directories that won't contain config files
          const skipDirs = [
            'node_modules', '.git', '.vscode', '.idea', 'build', 'dist',
            'out', '.gradle', '.dart_tool', 'pods', 'Pods', 'DerivedData',
            '__pycache__', '.pytest_cache', 'coverage', '.nyc_output'
          ];

          if (!skipDirs.includes(item.name) && !item.name.startsWith('.')) {
            // Recursively search subdirectories
            const subResult = this.findFirebaseConfigFiles(fullPath, maxDepth, currentDepth + 1);
            result.googleServices.push(...subResult.googleServices);
            result.googleServicesPlist.push(...subResult.googleServicesPlist);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read (permissions, etc.)
      console.log(`⚠️  Skipping directory: ${dir} (${error.message})`);
    }

    return result;
  }

  async getFirebaseInfoFromCLI(projectDir) {
    const firebaseInfo = {};
    
    try {
      console.log('🔍 Fetching Firebase project info from CLI...');
      
      // Get current Firebase project
      const currentProject = execSync('firebase use', { 
        cwd: projectDir, 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      
      const projectMatch = currentProject.match(/Active project: (.+)/);
      if (projectMatch) {
        firebaseInfo.projectId = projectMatch[1].trim();
        console.log(`✅ Found active Firebase project: ${firebaseInfo.projectId}`);
      }

      // Get Firebase apps for the project
      if (firebaseInfo.projectId) {
        try {
          const appsOutput = execSync(`firebase apps:list --project ${firebaseInfo.projectId}`, {
            cwd: projectDir,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
          });

          // Parse the apps list to find Android/iOS apps
          const lines = appsOutput.split('\n');
          for (const line of lines) {
            // Look for app lines (format: │ app-id │ platform │ display-name │)
            const appMatch = line.match(/│\s*([^\s│]+)\s*│\s*(android|ios)\s*│\s*([^│]+)\s*│/);
            if (appMatch) {
              const [, appId, platform, displayName] = appMatch;
              if (platform === 'android' && !firebaseInfo.appId) {
                firebaseInfo.appId = appId.trim();
                firebaseInfo.appDisplayName = displayName.trim();
                console.log(`✅ Found Firebase ${platform} app: ${appId.trim()}`);
                break;
              }
            }
          }
        } catch (error) {
          console.log('⚠️  Could not fetch Firebase apps list (authentication may be required)');
        }
      }

    } catch (error) {
      console.log('⚠️  Firebase CLI not available or not logged in');
      console.log('💡 Run "firebase login" and "firebase use <project-id>" to enable auto-detection');
    }

    return firebaseInfo;
  }

  async listFirebaseProjects() {
    try {
      console.log('📋 Fetching available Firebase projects...');
      const projectsOutput = execSync('firebase projects:list', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const projects = [];
      const lines = projectsOutput.split('\n');
      
      for (const line of lines) {
        // Parse project lines (format: │ project-id │ display-name │ resource-name │)
        const projectMatch = line.match(/│\s*([^\s│]+)\s*│\s*([^│]+)\s*│\s*([^│]+)\s*│/);
        if (projectMatch && !projectMatch[1].includes('Project ID')) {
          projects.push({
            id: projectMatch[1].trim(),
            displayName: projectMatch[2].trim(),
            resourceName: projectMatch[3].trim()
          });
        }
      }

      return projects;
    } catch (error) {
      console.log('⚠️  Could not fetch Firebase projects list');
      console.log('💡 Make sure you are logged in: firebase login');
      return [];
    }
  }

  async selectFirebaseProject() {
    const projects = await this.listFirebaseProjects();
    
    if (projects.length === 0) {
      return null;
    }

    console.log('\n📋 Available Firebase projects:');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.id} (${project.displayName})`);
    });

    const selection = await this.promptUser(
      `\nSelect project (1-${projects.length}) or enter project ID manually`,
      '1'
    );

    // Check if it's a number (selection) or project ID
    const selectionNum = parseInt(selection);
    if (!isNaN(selectionNum) && selectionNum >= 1 && selectionNum <= projects.length) {
      return projects[selectionNum - 1].id;
    } else {
      // Assume it's a project ID entered manually
      return selection;
    }
  }

  async selectFirebaseConfig(configs) {
    console.log('\n🔥 Multiple Firebase configurations found:');
    
    configs.forEach((config, index) => {
      const envName = this.extractEnvironmentName(config.file);
      const platform = config.type.toUpperCase();
      console.log(`${index + 1}. [${platform}] ${config.file}`);
      if (envName) {
        console.log(`   Environment: ${envName}`);
      }
    });

    const selection = await this.promptUser(
      `\nSelect configuration (1-${configs.length})`,
      '1'
    );

    const selectionNum = parseInt(selection);
    if (!isNaN(selectionNum) && selectionNum >= 1 && selectionNum <= configs.length) {
      const selected = configs[selectionNum - 1];
      const envName = this.extractEnvironmentName(selected.file);
      console.log(`✅ Selected ${selected.type} config: ${selected.file}`);
      if (envName) {
        console.log(`✅ Environment: ${envName}`);
      }
      return selected;
    } else {
      // Default to first config if invalid selection
      console.log('⚠️  Invalid selection, using first configuration');
      return configs[0];
    }
  }

  extractEnvironmentName(filePath) {
    // Try to extract environment name from file path
    const pathParts = filePath.toLowerCase().split(path.sep);
    
    // Common environment keywords
    const envKeywords = [
      'prod', 'production', 'release',
      'dev', 'development', 'debug',
      'staging', 'stage', 'test', 'testing',
      'qa', 'uat', 'demo', 'beta'
    ];
    
    // Look for environment keywords in path
    for (const part of pathParts) {
      for (const keyword of envKeywords) {
        if (part.includes(keyword)) {
          return this.capitalizeEnvironmentName(keyword);
        }
      }
    }
    
    // Try to infer from directory structure
    const relevantParts = pathParts.filter(part => 
      !['src', 'app', 'config', 'firebase', 'resources', 'assets'].includes(part)
    );
    
    // Look for capitalized environment names
    for (const part of relevantParts) {
      if (part.match(/^[A-Z][a-z]+$/)) {
        return part;
      }
    }
    
    return null;
  }

  capitalizeEnvironmentName(env) {
    const envMap = {
      'prod': 'Production',
      'production': 'Production',
      'release': 'Production',
      'dev': 'Development',
      'development': 'Development',
      'debug': 'Development',
      'staging': 'Staging',
      'stage': 'Staging',
      'test': 'Testing',
      'testing': 'Testing',
      'qa': 'QA',
      'uat': 'UAT',
      'demo': 'Demo',
      'beta': 'Beta'
    };
    
    return envMap[env.toLowerCase()] || env.charAt(0).toUpperCase() + env.slice(1);
  }

  parseGoogleServices(filePath) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        projectId: content.project_info?.project_id,
        appId: content.client?.[0]?.client_info?.mobilesdk_app_id,
        projectNumber: content.project_info?.project_number
      };
    } catch (error) {
      console.warn(`Warning: Could not parse google-services.json: ${error.message}`);
      return {};
    }
  }

  parseGoogleServicesPlist(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const projectIdMatch = content.match(/<key>PROJECT_ID<\/key>\s*<string>([^<]+)<\/string>/);
      const appIdMatch = content.match(/<key>GOOGLE_APP_ID<\/key>\s*<string>([^<]+)<\/string>/);
      
      return {
        projectId: projectIdMatch?.[1],
        appId: appIdMatch?.[1]
      };
    } catch (error) {
      console.warn(`Warning: Could not parse GoogleService-Info.plist: ${error.message}`);
      return {};
    }
  }

  async promptUser(question, defaultValue = '') {
    return new Promise((resolve) => {
      const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
      rl.question(prompt, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  async collectConfiguration() {
    console.log('🚀 Firebase Crashlytics to Kanban - Generic Workflow Generator\n');
    
    // Auto-detect project info
    console.log('🔍 Auto-detecting project configuration...');
    console.log('📁 Searching for Firebase config files recursively...');
    const detected = await this.detectProjectInfo();
    
    if (detected.platform) {
      console.log(`✅ Detected ${detected.platform} project`);
    }
    if (detected.firebase.projectId) {
      console.log(`✅ Detected Firebase project: ${detected.firebase.projectId}`);
    }
    if (detected.firebase.appId) {
      console.log(`✅ Detected Firebase app: ${detected.firebase.appId}`);
    }
    if (detected.name) {
      console.log(`✅ Detected project name: ${detected.name}`);
    }
    
    console.log('\n📝 Please provide the following information:\n');

    // Project configuration - use auto-detected values
    this.config.project.directory = detected.directory;
    this.config.project.name = detected.name || path.basename(detected.directory);
    this.config.project.platform = detected.platform || 'android';

    // Firebase configuration with smart detection
    if (!detected.firebase.projectId) {
      console.log('\n🔥 Firebase project not auto-detected. Let me help you find it...');
      const selectedProjectId = await this.selectFirebaseProject();
      if (selectedProjectId) {
        this.config.firebase.projectId = selectedProjectId;
        
        // Try to get apps for the selected project
        try {
          const appsOutput = execSync(`firebase apps:list --project ${selectedProjectId}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
          });
          
          // Parse and offer app selection
          const apps = this.parseFirebaseApps(appsOutput, this.config.project.platform);
          if (apps.length > 0) {
            console.log(`\n📱 Found ${this.config.project.platform} apps in ${selectedProjectId}:`);
            apps.forEach((app, index) => {
              console.log(`${index + 1}. ${app.id} (${app.displayName})`);
            });
            
            const appSelection = await this.promptUser(
              `Select app (1-${apps.length}) or enter app ID manually`,
              '1'
            );
            
            const appSelectionNum = parseInt(appSelection);
            if (!isNaN(appSelectionNum) && appSelectionNum >= 1 && appSelectionNum <= apps.length) {
              this.config.firebase.appId = apps[appSelectionNum - 1].id;
            } else {
              this.config.firebase.appId = appSelection;
            }
          }
        } catch (error) {
          // Fallback to manual entry
        }
      }
    } else {
      this.config.firebase.projectId = detected.firebase.projectId;
      this.config.firebase.appId = detected.firebase.appId;
    }

    // Fallback to manual entry if still not found
    if (!this.config.firebase.projectId) {
      this.config.firebase.projectId = await this.promptUser(
        'Firebase project ID', 
        ''
      );
    }
    
    if (!this.config.firebase.appId) {
      this.config.firebase.appId = await this.promptUser(
        'Firebase app ID', 
        ''
      );
    }

    // Kanban/Jira configuration
    console.log('\n🎯 Task Management System Configuration');
    const taskSystem = await this.promptUser(
      'Select task management system (vibe/jira)',
      'vibe'
    );

    this.config.kanban.system = taskSystem.toLowerCase();

    if (this.config.kanban.system === 'jira') {
      console.log('🎯 Using Jira (Atlassian MCP)');

      this.config.jira = this.config.jira || {};

      this.config.jira.cloudId = await this.promptUser(
        'Atlassian Cloud ID (or site URL, e.g., yoursite.atlassian.net)',
        ''
      );

      this.config.jira.projectKey = await this.promptUser(
        'Jira project key (e.g., PROJ)',
        ''
      );

      this.config.jira.issueType = await this.promptUser(
        'Default issue type (Bug/Task/Story)',
        'Bug'
      );

      console.log('✅ Jira configuration completed');
    } else {
      console.log('🎯 Using Vibe Kanban system');

      this.config.kanban.projectName = await this.promptUser(
        'Vibe Kanban project name',
        `${this.config.project.name}`
      );

      console.log('✅ Vibe Kanban configuration completed');
    }

    // Bitbucket configuration (optional for PR creation)
    console.log('\n🔀 Bitbucket Configuration (optional - for automated PR creation)');
    const useBitbucket = await this.promptUser(
      'Enable Bitbucket PR creation? (y/N)', 
      'N'
    );
    
    if (useBitbucket.toLowerCase() === 'y') {
      this.config.bitbucket.workspace = await this.promptUser(
        'Bitbucket workspace', 
        ''
      );
      
      this.config.bitbucket.repoSlug = await this.promptUser(
        'Bitbucket repository slug', 
        ''
      );
      
      this.config.bitbucket.targetBranch = await this.promptUser(
        'Target branch for PRs', 
        'develop'
      );
      
      const addReviewers = await this.promptUser(
        'Add default reviewers? (y/N)', 
        'N'
      );
      
      if (addReviewers.toLowerCase() === 'y') {
        const reviewers = await this.promptUser(
          'Reviewer usernames (comma-separated)', 
          ''
        );
        this.config.bitbucket.reviewers = reviewers.split(',').map(r => r.trim()).filter(r => r);
      }
      
      console.log('✅ Bitbucket integration configured');
    } else {
      console.log('⏭️  Skipping Bitbucket configuration');
    }

    // Optional: Custom thresholds
    const customizeThresholds = await this.promptUser(
      'Customize crash thresholds? (y/N)', 
      'N'
    );
    
    if (customizeThresholds.toLowerCase() === 'y') {
      this.config.thresholds.critical.crashes = parseInt(await this.promptUser(
        'Critical threshold - crashes', 
        this.config.thresholds.critical.crashes.toString()
      ));
      this.config.thresholds.high.crashes = parseInt(await this.promptUser(
        'High threshold - crashes', 
        this.config.thresholds.high.crashes.toString()
      ));
      this.config.thresholds.medium.crashes = parseInt(await this.promptUser(
        'Medium threshold - crashes', 
        this.config.thresholds.medium.crashes.toString()
      ));
    }

    console.log('\n✅ Configuration collected successfully!\n');
  }

  /**
   * Detect available AI CLIs and prompt user for execution mode
   */
  async selectExecutionMode() {
    // Skip if --generate-only flag is provided
    if (this.cliArgs.generateOnly) {
      console.log('📝 Generate-only mode (from --generate-only flag)');
      this.config.execution.mode = 'generate-only';
      return;
    }

    // Skip if --cli flag is provided
    if (this.cliArgs.forceCli) {
      const executor = this.aiExecutorFactory.getExecutor(this.cliArgs.forceCli);
      if (!executor) {
        console.log(`❌ Unknown CLI: ${this.cliArgs.forceCli}`);
        console.log('   Supported CLIs: claude, copilot, gemini, codex');
        process.exit(1);
      }
      
      if (!executor.isInstalled()) {
        console.log(`❌ ${executor.displayName} is not installed`);
        console.log(executor.getInstallInstructions());
        process.exit(1);
      }

      const authStatus = executor.checkAuth();
      if (!authStatus.authenticated) {
        console.log(`❌ ${executor.displayName} authentication failed: ${authStatus.message}`);
        console.log(executor.getAuthInstructions());
        process.exit(1);
      }

      this.config.execution.mode = 'cli';
      this.config.execution.cli = this.cliArgs.forceCli;
      console.log(`🤖 Using ${executor.displayName} (from --cli flag)`);
      return;
    }

    // Interactive mode: ask user preference first
    console.log('\n🤖 Execution Mode Selection');
    console.log('1. Generate workflow file only (manual execution)');
    console.log('2. Generate and execute with AI CLI (automated)');
    
    const modeChoice = await this.promptUser(
      'Select mode (1-2)',
      '1'
    );

    if (modeChoice === '1') {
      console.log('📝 Generating workflow file only');
      this.config.execution.mode = 'generate-only';
      return;
    }

    // User wants AI execution, now detect available CLIs
    console.log('\n🔍 Detecting available AI CLIs...');
    
    let availableExecutors;
    try {
      availableExecutors = this.aiExecutorFactory.detectAvailableExecutors();
    } catch (error) {
      console.log(`\n❌ Error detecting AI CLIs: ${error.message}`);
      console.log('⚠️  Falling back to generate-only mode');
      this.config.execution.mode = 'generate-only';
      return;
    }
    
    if (availableExecutors.length === 0) {
      console.log('⚠️  No AI CLIs detected');
      console.log('💡 Workflow will be generated for manual execution');
      this.config.execution.mode = 'generate-only';
      return;
    }

    // Check authentication for available executors
    const readyExecutors = availableExecutors.filter(executor => {
      try {
        const authStatus = executor.checkAuth();
        return authStatus.authenticated;
      } catch (error) {
        console.log(`   ⚠️  ${executor.displayName}: Error checking auth - ${error.message}`);
        return false;
      }
    });

    console.log(`\n✅ Found ${availableExecutors.length} installed AI CLI(s):`);
    availableExecutors.forEach(executor => {
      const authStatus = executor.checkAuth();
      const status = authStatus.authenticated ? '✓ Ready' : '⚠ Not authenticated';
      console.log(`   - ${executor.displayName}: ${status}`);
    });

    // Build options
    const options = ['Generate workflow file only'];
    const executorMap = {};
    let optionIndex = 2;

    readyExecutors.forEach(executor => {
      options.push(`Generate and execute with ${executor.displayName}`);
      executorMap[optionIndex] = executor.name;
      optionIndex++;
    });

    // Show not authenticated executors
    const notAuthExecutors = availableExecutors.filter(e => !readyExecutors.includes(e));
    if (notAuthExecutors.length > 0) {
      console.log('\n⚠️  Not authenticated:');
      notAuthExecutors.forEach(executor => {
        console.log(`   - ${executor.displayName}`);
        console.log(`     ${executor.getAuthInstructions()}`);
      });
    }

    // Prompt user
    console.log('\n📋 How would you like to proceed?');
    options.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option}`);
    });

    const defaultChoice = readyExecutors.length > 0 ? '2' : '1';
    const choice = await this.promptUser(
      `Select option (1-${options.length})`,
      defaultChoice
    );

    const choiceNum = parseInt(choice);
    if (choiceNum === 1) {
      this.config.execution.mode = 'generate-only';
      console.log('📝 Generating workflow file only');
    } else if (choiceNum >= 2 && choiceNum <= options.length) {
      this.config.execution.mode = 'cli';
      this.config.execution.cli = executorMap[choiceNum];
      const executor = this.aiExecutorFactory.getExecutor(this.config.execution.cli);
      console.log(`🤖 Will execute with ${executor.displayName}`);
    } else {
      console.log('⚠️  Invalid choice, defaulting to generate-only mode');
      this.config.execution.mode = 'generate-only';
    }
  }

  parseFirebaseApps(appsOutput, targetPlatform) {
    const apps = [];
    const lines = appsOutput.split('\n');
    
    for (const line of lines) {
      const appMatch = line.match(/│\s*([^\s│]+)\s*│\s*(android|ios|web)\s*│\s*([^│]+)\s*│/);
      if (appMatch) {
        const [, appId, platform, displayName] = appMatch;
        if (platform === targetPlatform || targetPlatform === 'flutter') {
          apps.push({
            id: appId.trim(),
            platform: platform.trim(),
            displayName: displayName.trim()
          });
        }
      }
    }
    
    return apps;
  }

  generateWorkflow() {
    const template = this.loadTemplate();
    let workflow = template;

    // Replace placeholders
    const replacements = {
      '{{PROJECT_DIR}}': this.config.project.directory,
      '{{PROJECT_NAME}}': this.config.project.name,
      '{{PLATFORM}}': this.config.project.platform,
      '{{FIREBASE_PROJECT_ID}}': this.config.firebase.projectId,
      '{{APP_ID}}': this.config.firebase.appId,
      '{{KANBAN_SYSTEM}}': this.config.kanban.system,
      '{{KANBAN_PROJECT_NAME}}': this.config.kanban.projectName || this.config.project.name,
      '{{JIRA_CLOUD_ID}}': this.config.jira?.cloudId || 'your-atlassian-cloud-id',
      '{{JIRA_PROJECT_KEY}}': this.config.jira?.projectKey || 'PROJ',
      '{{JIRA_ISSUE_TYPE}}': this.config.jira?.issueType || 'Bug',
      '{{CRITICAL_CRASHES}}': this.config.thresholds.critical.crashes,
      '{{HIGH_CRASHES}}': this.config.thresholds.high.crashes,
      '{{MEDIUM_CRASHES}}': this.config.thresholds.medium.crashes,
      '{{CRITICAL_USERS}}': this.config.thresholds.critical.users,
      '{{HIGH_USERS}}': this.config.thresholds.high.users,
      '{{MEDIUM_USERS}}': this.config.thresholds.medium.users,
      '{{FIREBASE_CONFIG_FILE}}': this.config.firebase.configFile || 'auto-detected',
      '{{FIREBASE_ENVIRONMENT}}': this.config.firebase.environment || 'default',
      '{{BITBUCKET_WORKSPACE}}': this.config.bitbucket?.workspace || 'your-workspace',
      '{{BITBUCKET_REPO_SLUG}}': this.config.bitbucket?.repoSlug || 'your-repo',
      '{{BITBUCKET_TARGET_BRANCH}}': this.config.bitbucket?.targetBranch || 'develop',
      '{{BITBUCKET_REVIEWERS}}': this.config.bitbucket?.reviewers?.join(', ') || 'team-lead',
      '{{BITBUCKET_ENABLED}}': this.config.bitbucket?.workspace ? 'enabled' : 'disabled'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      workflow = workflow.replace(new RegExp(placeholder, 'g'), value);
    }

    return workflow;
  }

  loadTemplate() {
    // When installed globally, find template relative to this script
    const templatePath = path.join(__dirname, 'crashAnalyzer.template.md');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    return fs.readFileSync(templatePath, 'utf8');
  }

  saveWorkflow(workflow) {
    // Save to current working directory, not script directory
    const outputPath = path.join(process.cwd(), 'crashAnalyzer.md');
    fs.writeFileSync(outputPath, workflow);
    console.log(`📄 Generated workflow saved to: ${outputPath}`);
  }

  saveConfig() {
    // Save config to script directory for global installs, or current directory for local
    const isGlobalInstall = __dirname.includes('node_modules');
    const configPath = isGlobalInstall 
      ? path.join(require('os').homedir(), '.crash-analyzer-config.json')
      : path.join(__dirname, 'last-config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log(`💾 Configuration saved to: ${configPath}`);
  }

  /**
   * Execute the workflow with selected AI CLI
   * @param {string} workflowPath - Path to the generated workflow file
   * @returns {Promise<void>}
   */
  async executeWorkflow(workflowPath) {
    if (this.config.execution.mode !== 'cli' || !this.config.execution.cli) {
      return;
    }

    const executor = this.aiExecutorFactory.getExecutor(this.config.execution.cli);
    if (!executor) {
      console.error(`❌ Executor not found: ${this.config.execution.cli}`);
      process.exit(2);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting AI CLI Execution`);
    console.log(`${'='.repeat(60)}\n`);

    // Create log file
    const logPath = path.join(process.cwd(), 'crashAnalyzer.execution.log');
    const logStream = fs.createWriteStream(logPath, { flags: 'w' });
    
    logStream.write(`Crash Analyzer Execution Log\n`);
    logStream.write(`Generated: ${new Date().toISOString()}\n`);
    logStream.write(`AI CLI: ${executor.displayName}\n`);
    logStream.write(`Workflow: ${workflowPath}\n`);
    logStream.write(`${'='.repeat(60)}\n\n`);

    try {
      const result = executor.execute(workflowPath);
      
      if (result.success) {
        logStream.write('Status: SUCCESS\n');
        if (result.output) {
          logStream.write(`\nOutput:\n${result.output}\n`);
        }
        logStream.end();
        
        console.log(`\n${'='.repeat(60)}`);
        console.log('✅ Workflow executed successfully!');
        console.log(`${'='.repeat(60)}\n`);
        console.log(`📝 Execution log saved to: ${logPath}`);
      } else {
        logStream.write('Status: FAILED\n');
        if (result.error) {
          logStream.write(`\nError:\n${result.error}\n`);
        }
        logStream.end();
        
        console.log(`\n${'='.repeat(60)}`);
        console.error('❌ Workflow execution failed');
        console.log(`${'='.repeat(60)}\n`);
        console.error('Error:', result.error);
        console.log(`\n📝 Execution log saved to: ${logPath}`);
        process.exit(2);
      }
    } catch (error) {
      logStream.write(`Status: ERROR\n`);
      logStream.write(`\nException:\n${error.message}\n${error.stack}\n`);
      logStream.end();
      
      console.error('\n❌ Unexpected error during execution:', error.message);
      console.log(`📝 Execution log saved to: ${logPath}`);
      process.exit(2);
    }
  }

  async run() {
    try {
      // Show help if requested
      if (this.cliArgs.help) {
        this.showHelp();
        process.exit(0);
      }

      // Collect configuration
      await this.collectConfiguration();
      
      // Select execution mode
      await this.selectExecutionMode();
      
      // Generate workflow
      const workflow = this.generateWorkflow();
      this.saveWorkflow(workflow);
      this.saveConfig();
      
      const workflowPath = path.join(process.cwd(), 'crashAnalyzer.md');
      
      console.log('\n🎉 Success! Your crash analyzer workflow has been generated.');
      console.log(`📄 Workflow file: ${workflowPath}`);
      
      // Execute if requested
      if (this.config.execution.mode === 'cli') {
        await this.executeWorkflow(workflowPath);
      } else {
        console.log('\n📋 Next steps:');
        console.log('1. Review the generated crashAnalyzer.md file');
        console.log('2. Update any project-specific details as needed');
        console.log('3. Run the workflow with your AI assistant manually');
        console.log('\n💡 Tip: Use --cli <name> to execute automatically next time');
      }
      
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      process.exit(1);
    } finally {
      rl.close();
    }
  }
}

// Run the generator
if (require.main === module) {
  const generator = new CrashAnalyzerGenerator();
  generator.run();
}

module.exports = CrashAnalyzerGenerator;
