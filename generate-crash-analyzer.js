#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execSync } = require('child_process');
const { AIExecutorFactory } = require('./ai-executors');

// Maps template variable names to config values
const TEMPLATE_VAR_MAP = {
  PLATFORM:          (c) => c.project?.platform,
  BITBUCKET_ENABLED: (c) => c.bitbucket?.workspace ? 'enabled' : 'disabled',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class CrashAnalyzerGenerator {
  constructor() {
    this.config = {
      project: {},
      firebase: {},
      jira: {},
      bitbucket: {},
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
      global: false,
      force: false,
      dryRun: false,
      alsoClaude: false,
      alsoGemini: false,
      useLastConfig: false,
      configFile: null,
      zeroConfig: false,
      initProject: false,
      help: false,
    };

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--global':          parsed.global = true; break;
        case '--force':           parsed.force = true; break;
        case '--dry-run':         parsed.dryRun = true; break;
        case '--also-claude':     parsed.alsoClaude = true; break;
        case '--also-gemini':     parsed.alsoGemini = true; break;
        case '--use-last-config': parsed.useLastConfig = true; break;
        case '--zero-config':     parsed.zeroConfig = true; break;
        case '--init-project':    parsed.initProject = true; break;
        case '--help': case '-h': parsed.help = true; break;
        case '--config':
          if (args[i + 1]) { parsed.configFile = args[++i]; }
          break;
        // Legacy flags: warn and ignore
        case '--generate-only':
          console.warn('Warning: --generate-only removed in v2. Skills are always installed. Use --dry-run to preview.');
          break;
        case '--cli':
          console.warn('Warning: --cli removed in v2. AI agents auto-activate from the installed skill.');
          if (args[i + 1] && !args[i + 1].startsWith('--')) i++;
          break;
      }
    }

    return parsed;
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log(`
🔥 Firebase Crashlytics → Jira Skill Installer

Usage: crash-to-vibe [options]

Zero-config global mode (install once, use everywhere):
  --zero-config       Install global skill to all known CLI skill dirs (Claude Code,
                      Gemini, Codex, Copilot, Cursor, Cline, Kiro, Antigravity, Amp,
                      OpenCode, ~/.agents/skills/) — reads crash-to-vibe.json at runtime
  --init-project      Create crash-to-vibe.json in current directory (Jira config)

Per-project mode (bakes config into skill):
  --use-last-config   Skip prompts, reuse last saved configuration
  --config <file>     Load predefined config file (for team sharing)
  --global            Install to ~/.agents/skills/ instead of ./.agents/skills/
  --force             Overwrite existing skill installation
  --dry-run           Preview files to be written without writing
  --also-claude       Also install to .claude/skills/
  --also-gemini       Also install to .gemini/skills/

  --help, -h          Show this help

Examples:
  crash-to-vibe --zero-config             # Install global zero-config skill (once)
  crash-to-vibe --init-project            # Create crash-to-vibe.json in project root
  crash-to-vibe                           # Interactive per-project setup
  crash-to-vibe --use-last-config         # Reinstall with saved config
  crash-to-vibe --config team.json        # Use team's shared config
  crash-to-vibe --dry-run                 # Preview what would be installed
  crash-to-vibe --force                   # Overwrite existing installation
  crash-to-vibe --global --also-claude    # Install globally + .claude/skills/

After installation your AI agent auto-activates when you mention crashes or
Firebase Crashlytics. Supports Claude Code, Gemini CLI, Codex, GitHub Copilot.
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
    console.log('🚀 Firebase Crashlytics → Jira Skill Installer\n');
    
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

    // Jira configuration
    console.log('\n🎯 Jira Configuration (Atlassian MCP)');

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

    this.config.jira.labels = await this.promptUser(
      'Default Jira labels (comma-separated)',
      'crash-to-vibe'
    );

    console.log('✅ Jira configuration completed');

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
  /**
   * Resolve {{#if (eq VAR "VALUE")}}...{{/if}} blocks using config values.
   * Bare {{#if signal}} blocks are left untouched (rewritten as prose in templates).
   */
  resolveConditionals(content, config) {
    const pattern = /\{\{#if \(eq (\w+) "([^"]+)"\)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    let prev = null;
    let result = content;
    while (prev !== result) {
      prev = result;
      result = result.replace(pattern, (_, varName, expected, body) => {
        const actual = TEMPLATE_VAR_MAP[varName]?.(config);
        return actual === expected ? body : '';
      });
    }
    return result.replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Replace {{TOKEN}} placeholders with config values.
   */
  resolvePlaceholders(content, config) {
    const replacements = {
      '{{PROJECT_DIR}}':             config.project.directory || '',
      '{{PROJECT_NAME}}':            config.project.name || '',
      '{{PLATFORM}}':                config.project.platform || '',
      '{{FIREBASE_PROJECT_ID}}':     config.firebase.projectId || '',
      '{{APP_ID}}':                  config.firebase.appId || '',
      '{{JIRA_CLOUD_ID}}':           config.jira?.cloudId || '',
      '{{JIRA_PROJECT_KEY}}':        config.jira?.projectKey || '',
      '{{JIRA_ISSUE_TYPE}}':         config.jira?.issueType || 'Bug',
      '{{JIRA_LABELS}}':             config.jira?.labels || 'crash-to-vibe',
      '{{CRITICAL_CRASHES}}':        String(config.thresholds.critical.crashes),
      '{{HIGH_CRASHES}}':            String(config.thresholds.high.crashes),
      '{{MEDIUM_CRASHES}}':          String(config.thresholds.medium.crashes),
      '{{CRITICAL_USERS}}':          String(config.thresholds.critical.users),
      '{{HIGH_USERS}}':              String(config.thresholds.high.users),
      '{{MEDIUM_USERS}}':            String(config.thresholds.medium.users),
      '{{FIREBASE_CONFIG_FILE}}':    config.firebase.configFile || 'auto-detected',
      '{{FIREBASE_ENVIRONMENT}}':    config.firebase.environment || 'default',
      '{{BITBUCKET_WORKSPACE}}':     config.bitbucket?.workspace || '',
      '{{BITBUCKET_REPO_SLUG}}':     config.bitbucket?.repoSlug || '',
      '{{BITBUCKET_TARGET_BRANCH}}': config.bitbucket?.targetBranch || 'develop',
      '{{BITBUCKET_REVIEWERS}}':     config.bitbucket?.reviewers?.join(', ') || '',
      '{{BITBUCKET_ENABLED}}':       config.bitbucket?.workspace ? 'enabled' : 'disabled',
    };

    let result = content;
    for (const [token, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), value ?? '');
    }
    return result;
  }

  /**
   * Generate all skill files from templates.
   * Pure function — no file I/O. Returns Map<relativePath, resolvedContent>.
   */
  generateSkillFiles(config) {
    const files = new Map();
    const tmplDir = path.join(__dirname, 'templates', 'skill');

    const processTemplate = (relPath) => {
      const tmplPath = path.join(tmplDir, relPath);
      if (!fs.existsSync(tmplPath)) {
        throw new Error(`Template not found: ${tmplPath}`);
      }
      let content = fs.readFileSync(tmplPath, 'utf8');
      content = this.resolveConditionals(content, config);
      return this.resolvePlaceholders(content, config);
    };

    files.set('SKILL.md',                        processTemplate('SKILL.md.tmpl'));
    files.set('references/task-templates.md',    processTemplate('references/task-templates.md.tmpl'));
    files.set('references/platform-patterns.md', processTemplate('references/platform-patterns.md.tmpl'));

    if (config.bitbucket?.workspace) {
      files.set('references/pr-workflow.md',     processTemplate('references/pr-workflow.md.tmpl'));
    }

    return files;
  }

  /**
   * Write skill directory to one or more target paths.
   */
  installSkill(skillFiles, targetDirs, { force = false, dryRun = false } = {}) {
    const written = [];
    const SKILL_NAME = 'crash-to-vibe';

    for (const targetDir of targetDirs) {
      const skillDir = path.join(targetDir, SKILL_NAME);

      if (fs.existsSync(skillDir) && !force && !dryRun) {
        throw new Error(
          `Skill already installed at: ${skillDir}\nUse --force to overwrite.`
        );
      }

      for (const [rel, content] of skillFiles) {
        const absPath = path.join(skillDir, rel);
        if (!dryRun) {
          fs.mkdirSync(path.dirname(absPath), { recursive: true });
          fs.writeFileSync(absPath, content, 'utf8');
        }
        written.push(absPath);
      }
    }

    return written;
  }

  /**
   * Build list of target skill parent directories based on CLI flags.
   */
  buildTargetDirs(cliArgs) {
    const base = cliArgs.global ? os.homedir() : process.cwd();
    const dirs = [path.join(base, '.agents', 'skills')];
    if (cliArgs.alsoClaude) dirs.push(path.join(base, '.claude', 'skills'));
    if (cliArgs.alsoGemini) dirs.push(path.join(base, '.gemini', 'skills'));
    return dirs;
  }

  printSuccessMessage(targetDirs, writtenPaths, dryRun, zeroConfig = false) {
    console.log(`\n✅ Skill ${dryRun ? 'preview' : 'installed'}!\n`);

    for (const p of writtenPaths) {
      const rel = path.relative(process.cwd(), p);
      console.log(`  📄 ${rel}`);
    }

    if (!dryRun) {
      if (zeroConfig) {
        console.log(`\nGlobal skill installed for: Claude Code, Gemini, Codex, Copilot, Cursor, Cline, Kiro, Antigravity, Amp, OpenCode`);
        console.log(`\nNext steps:`);
        console.log(`  1. In each mobile project, run: crash-to-vibe --init-project`);
        console.log(`  2. Open Claude Code (or Gemini CLI / Copilot) in your project and say:`);
        console.log(`       "analyze my Firebase crashes and create Jira issues"`);
      } else {
        console.log(`\nYour AI agent will auto-activate when you mention crashes or Crashlytics.`);
        console.log(`Try: "analyze my Firebase crashes for ${this.config.project.name || 'my app'}"`);
        console.log(`\nNext run: crash-to-vibe --use-last-config`);
      }
    } else {
      console.log(`\nNo files written (dry run).`);
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


  /**
   * Generate skill files for zero-config global skill.
   * Static copy — no placeholder resolution needed.
   */
  generateZeroConfigSkillFiles() {
    const files = new Map();
    const tmplDir = path.join(__dirname, 'templates', 'skill-zero-config');

    const readStatic = (relPath) => {
      const filePath = path.join(tmplDir, relPath);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Zero-config template not found: ${filePath}`);
      }
      return fs.readFileSync(filePath, 'utf8');
    };

    files.set('SKILL.md',                        readStatic('SKILL.md'));
    files.set('references/task-templates.md',    readStatic('references/task-templates.md'));
    files.set('references/platform-patterns.md', readStatic('references/platform-patterns.md'));
    files.set('references/pr-workflow.md',       readStatic('references/pr-workflow.md'));

    return files;
  }

  /**
   * Interactively create crash-to-vibe.json in cwd.
   */
  async initProject() {
    console.log('\n🔧 Creating crash-to-vibe.json for this project\n');
    console.log('This file stores your Jira config so the global skill can use it at runtime.');
    console.log('Commit it to your repo so teammates get the same config.\n');

    const outputPath = path.join(process.cwd(), 'crash-to-vibe.json');

    if (fs.existsSync(outputPath) && !this.cliArgs.force) {
      const overwrite = await this.promptUser(
        `crash-to-vibe.json already exists. Overwrite? (y/N)`, 'N'
      );
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Aborted. Use --force to skip this prompt.');
        return;
      }
    }

    const cloudId = await this.promptUser('Atlassian Cloud ID (e.g. company.atlassian.net)', '');
    const projectKey = await this.promptUser('Jira project key (e.g. PROJ)', '');
    const issueType = await this.promptUser('Default issue type (Bug/Task/Story)', 'Bug');
    const labels = await this.promptUser('Jira labels (comma-separated)', 'crash-to-vibe');

    const addBitbucket = await this.promptUser('Add Bitbucket config for PR automation? (y/N)', 'N');
    let bitbucket = undefined;
    if (addBitbucket.toLowerCase() === 'y') {
      const workspace = await this.promptUser('Bitbucket workspace', '');
      const repoSlug = await this.promptUser('Repository slug', '');
      const targetBranch = await this.promptUser('Target branch', 'develop');
      bitbucket = { workspace, repoSlug, targetBranch, reviewers: [] };
    }

    const projectConfig = {
      jira: { cloudId, projectKey, issueType, labels },
      ...(bitbucket ? { bitbucket } : {}),
    };

    fs.writeFileSync(outputPath, JSON.stringify(projectConfig, null, 2) + '\n');
    console.log(`\n✅ Created: ${outputPath}`);
    console.log('\nCommit this file to your repo. Your team will use it automatically.');
    console.log('The global skill reads it when you say "analyze my crashes".');
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

  loadLastConfig() {
    // Try to load from global location first, then local
    const isGlobalInstall = __dirname.includes('node_modules');
    const globalConfigPath = path.join(require('os').homedir(), '.crash-analyzer-config.json');
    const localConfigPath = path.join(__dirname, 'last-config.json');
    
    const configPath = isGlobalInstall && fs.existsSync(globalConfigPath)
      ? globalConfigPath
      : fs.existsSync(localConfigPath)
        ? localConfigPath
        : null;

    if (!configPath) {
      throw new Error('No saved configuration found. Run without --use-last-config first.');
    }

    try {
      const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`✅ Loaded configuration from: ${configPath}`);
      console.log(`📋 Project: ${savedConfig.project.name} (${savedConfig.project.platform})`);
      console.log(`🔥 Firebase: ${savedConfig.firebase.projectId}`);
      
      // Merge with current config to preserve defaults and structure
      this.config = { ...this.config, ...savedConfig };
      
      return true;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  loadPredefinedConfig(configFilePath) {
    // Resolve config file path (support relative and absolute paths)
    const resolvedPath = path.isAbsolute(configFilePath)
      ? configFilePath
      : path.join(process.cwd(), configFilePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Configuration file not found: ${resolvedPath}`);
    }

    try {
      const predefinedConfig = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      
      // Validate required fields
      const requiredFields = [
        'project.name',
        'project.platform',
        'firebase.projectId',
        'firebase.appId',
        'jira.cloudId',
        'jira.projectKey',
      ];
      
      for (const field of requiredFields) {
        const keys = field.split('.');
        let value = predefinedConfig;
        for (const key of keys) {
          value = value?.[key];
        }
        if (!value) {
          throw new Error(`Missing required field in config file: ${field}`);
        }
      }

      console.log(`✅ Loaded predefined configuration from: ${resolvedPath}`);
      console.log(`📋 Project: ${predefinedConfig.project.name} (${predefinedConfig.project.platform})`);
      console.log(`🔥 Firebase: ${predefinedConfig.firebase.projectId}`);
      console.log(`📊 Jira Project: ${predefinedConfig.jira.projectKey}`);

      if (predefinedConfig.bitbucket?.workspace) {
        console.log(`🔀 Bitbucket: ${predefinedConfig.bitbucket.workspace}/${predefinedConfig.bitbucket.repoSlug}`);
      }
      
      // Merge with current config to preserve defaults and structure
      this.config = { ...this.config, ...predefinedConfig };
      
      return true;
    } catch (error) {
      if (error.message.includes('Missing required field')) {
        throw error;
      }
      throw new Error(`Failed to load configuration file: ${error.message}`);
    }
  }


  async run() {
    try {
      if (this.cliArgs.help) {
        this.showHelp();
        process.exit(0);
      }

      // --init-project: create crash-to-vibe.json in cwd
      if (this.cliArgs.initProject) {
        await this.initProject();
        process.exit(0);
      }

      // --zero-config: install static global skill to all known CLI skill dirs
      if (this.cliArgs.zeroConfig) {
        console.log('⚙️  Installing zero-config global skill...');
        const skillFiles = this.generateZeroConfigSkillFiles();
        // Install to every known global skill directory so all CLIs pick it up
        const home = os.homedir();
        const dirs = [
          path.join(home, '.claude', 'skills'),           // Claude Code
          path.join(home, '.gemini', 'skills'),           // Gemini CLI
          path.join(home, '.codex', 'skills'),            // OpenAI Codex CLI
          path.join(home, '.copilot', 'skills'),          // GitHub Copilot CLI
          path.join(home, '.cursor', 'skills'),           // Cursor
          path.join(home, '.cline', 'skills'),            // Cline
          path.join(home, '.kiro', 'skills'),             // Kiro (AWS)
          path.join(home, '.antigravity', 'skills'),      // Antigravity
          path.join(home, '.config', 'amp', 'skills'),    // Amp (Sourcegraph)
          path.join(home, '.config', 'opencode', 'skills'), // OpenCode
          path.join(home, '.agents', 'skills'),           // Agent Skills standard
        ];

        const written = this.installSkill(skillFiles, dirs, {
          force: this.cliArgs.force,
          dryRun: this.cliArgs.dryRun,
        });

        this.printSuccessMessage(dirs, written, this.cliArgs.dryRun, true);
        process.exit(0);
      }

      // Per-project mode: load config → generate → install
      if (this.cliArgs.configFile) {
        console.log('📦 Loading predefined configuration...\n');
        this.loadPredefinedConfig(this.cliArgs.configFile);
      } else if (this.cliArgs.useLastConfig) {
        console.log('🔄 Using last saved configuration...\n');
        this.loadLastConfig();
      } else {
        await this.collectConfiguration();
      }

      console.log('\n⚙️  Generating crash-to-vibe skill...');
      const skillFiles = this.generateSkillFiles(this.config);
      const targetDirs = this.buildTargetDirs(this.cliArgs);

      const written = this.installSkill(skillFiles, targetDirs, {
        force: this.cliArgs.force,
        dryRun: this.cliArgs.dryRun,
      });

      if (!this.cliArgs.dryRun) {
        this.saveConfig();
      }

      this.printSuccessMessage(targetDirs, written, this.cliArgs.dryRun, false);
      process.exit(0);

    } catch (error) {
      console.error('❌ Error:', error.message);
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
