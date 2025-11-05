#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Timeout for CLI detection commands (5 seconds)
const CLI_CHECK_TIMEOUT = 5000;

/**
 * Safely execute a command with timeout
 * @param {string} command 
 * @param {number} timeout 
 * @returns {object} { success: boolean, output: string }
 */
function safeExec(command, timeout = CLI_CHECK_TIMEOUT) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: timeout
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: null, error: error.message };
  }
}

/**
 * Base class for AI CLI executors
 */
class AIExecutor {
  constructor(name, displayName) {
    this.name = name;
    this.displayName = displayName;
  }

  /**
   * Check if the AI CLI is installed
   * @returns {boolean}
   */
  isInstalled() {
    throw new Error('isInstalled() must be implemented by subclass');
  }

  /**
   * Check if user is authenticated with the AI CLI
   * @returns {object} { authenticated: boolean, message: string }
   */
  checkAuth() {
    throw new Error('checkAuth() must be implemented by subclass');
  }

  /**
   * Get the command to execute the workflow
   * @param {string} workflowPath - Path to the generated workflow file
   * @returns {string}
   */
  getCommand(workflowPath) {
    throw new Error('getCommand() must be implemented by subclass');
  }

  /**
   * Execute the workflow with this AI CLI
   * @param {string} workflowPath - Path to the generated workflow file
   * @returns {object} { success: boolean, output: string, error: string }
   */
  execute(workflowPath) {
    try {
      const command = this.getCommand(workflowPath);
      console.log(`\n🤖 Executing with ${this.displayName}...`);
      console.log(`📝 Command: ${command}\n`);

      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'inherit', // Show output in real-time
        cwd: process.cwd()
      });

      return { 
        success: true, 
        output: output || 'Execution completed successfully',
        error: null 
      };
    } catch (error) {
      return { 
        success: false, 
        output: null, 
        error: error.message 
      };
    }
  }

  /**
   * Get installation instructions for this CLI
   * @returns {string}
   */
  getInstallInstructions() {
    throw new Error('getInstallInstructions() must be implemented by subclass');
  }

  /**
   * Get authentication instructions for this CLI
   * @returns {string}
   */
  getAuthInstructions() {
    throw new Error('getAuthInstructions() must be implemented by subclass');
  }
}

/**
 * Claude Code CLI executor
 */
class ClaudeExecutor extends AIExecutor {
  constructor() {
    super('claude', 'Claude Code');
  }

  isInstalled() {
    const result = safeExec('which claude');
    return result.success;
  }

  checkAuth() {
    const result = safeExec('claude auth status');
    if (result.success && result.output) {
      if (result.output.toLowerCase().includes('authenticated') || 
          result.output.toLowerCase().includes('logged in')) {
        return { authenticated: true, message: 'Authenticated' };
      }
    }
    return { authenticated: false, message: 'Not authenticated' };
  }

  getCommand(workflowPath) {
    // Claude Code: Use -p flag for non-interactive prompt execution
    return `claude -p "$(cat ${workflowPath})"`;
  }

  getInstallInstructions() {
    return `To install Claude CLI:
1. Visit: https://claude.ai/download
2. Download and install the Claude CLI
3. Run: claude auth login`;
  }

  getAuthInstructions() {
    return `To authenticate with Claude:
Run: claude auth login`;
  }
}

/**
 * GitHub Copilot CLI executor
 */
class CopilotExecutor extends AIExecutor {
  constructor() {
    super('copilot', 'GitHub Copilot CLI');
  }

  isInstalled() {
    const result = safeExec('which copilot');
    return result.success;
  }

  checkAuth() {
    const versionCheck = safeExec('copilot --version');
    if (!versionCheck.success) {
      return { authenticated: false, message: 'Not authenticated or not installed' };
    }
    
    // Check for authentication tokens
    if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
      return { authenticated: true, message: 'Authenticated via token' };
    }
    
    // Assume authenticated if copilot runs
    return { authenticated: true, message: 'Authenticated' };
  }

  getCommand(workflowPath) {
    // Copilot CLI with auto-execution enabled, denying destructive operations
    // Use command substitution to read file content and pass as prompt
    return `copilot --allow-all-tools --deny-tool 'shell(rm)' --deny-tool 'shell(git push)' -p "Execute this workflow: $(cat '${workflowPath}')"`;
  }

  getInstallInstructions() {
    return `To install GitHub Copilot CLI:
1. Install globally: npm install -g @github/copilot
2. Authenticate: Set GH_TOKEN or GITHUB_TOKEN environment variable
   - Generate token at: https://github.com/settings/personal-access-tokens/new
   - Enable "Copilot Requests" permission
   - Set: export GH_TOKEN=your-token-here`;
  }

  getAuthInstructions() {
    return `To authenticate with GitHub Copilot CLI:
1. Generate a fine-grained PAT at: https://github.com/settings/personal-access-tokens/new
2. Enable "Copilot Requests" permission
3. Set environment variable: export GH_TOKEN=your-token-here
   Or: export GITHUB_TOKEN=your-token-here`;
  }
}

/**
 * Gemini CLI executor
 */
class GeminiExecutor extends AIExecutor {
  constructor() {
    super('gemini', 'Gemini CLI');
  }

  isInstalled() {
    const result = safeExec('which gemini');
    return result.success;
  }

  checkAuth() {
    const result = safeExec('gemini auth status');
    if (result.success && result.output) {
      if (result.output.toLowerCase().includes('authenticated') || 
          result.output.toLowerCase().includes('logged in')) {
        return { authenticated: true, message: 'Authenticated' };
      }
    }
    return { authenticated: false, message: 'Not authenticated' };
  }

  getCommand(workflowPath) {
    // Gemini CLI: Use -p flag for non-interactive prompt execution with auto-approval
    return `gemini -p "$(cat ${workflowPath})" --auto-approve`;
  }

  getInstallInstructions() {
    return `To install Gemini CLI:
1. Visit: https://ai.google.dev/gemini-api/docs/cli
2. Install using: npm install -g @google/generative-ai-cli
3. Authenticate: gemini auth login`;
  }

  getAuthInstructions() {
    return `To authenticate with Gemini:
Run: gemini auth login`;
  }
}

/**
 * Codex CLI executor
 */
class CodexExecutor extends AIExecutor {
  constructor() {
    super('codex', 'Codex CLI');
  }

  isInstalled() {
    const result = safeExec('which codex');
    return result.success;
  }

  checkAuth() {
    // Codex CLI uses OpenAI API key or ChatGPT account
    if (process.env.OPENAI_API_KEY) {
      return { authenticated: true, message: 'OpenAI API key found' };
    }
    // Check if codex is configured (authenticated via ChatGPT)
    try {
      const configPath = require('path').join(require('os').homedir(), '.codex', 'config.toml');
      if (fs.existsSync(configPath)) {
        return { authenticated: true, message: 'Codex config found' };
      }
    } catch (error) {
      // Config check failed, continue
    }
    return { authenticated: false, message: 'No API key or auth found' };
  }

  getCommand(workflowPath) {
    // Codex CLI: Use exec command for non-interactive execution with the workflow content
    return `codex exec "$(cat ${workflowPath})"`;
  }

  getInstallInstructions() {
    return `To install Codex CLI:
1. Install: npm install -g @openai/codex
   Or: brew install codex
2. Run: codex (will prompt for ChatGPT login or API key)`;
  }

  getAuthInstructions() {
    return `To authenticate with Codex CLI:
1. Run 'codex' and sign in with ChatGPT account
   Or
2. Set environment variable: export OPENAI_API_KEY=your-key-here`;
  }
}

/**
 * Factory to create and manage AI executors
 */
class AIExecutorFactory {
  constructor() {
    this.executors = [
      new ClaudeExecutor(),
      new CopilotExecutor(),
      new GeminiExecutor(),
      new CodexExecutor()
    ];
  }

  /**
   * Get all registered executors
   * @returns {AIExecutor[]}
   */
  getAllExecutors() {
    return this.executors;
  }

  /**
   * Get executor by name
   * @param {string} name
   * @returns {AIExecutor|null}
   */
  getExecutor(name) {
    return this.executors.find(e => e.name === name) || null;
  }

  /**
   * Detect all installed and available AI CLIs with progress indication
   * @returns {AIExecutor[]}
   */
  detectAvailableExecutors() {
    const available = [];
    
    for (const executor of this.executors) {
      try {
        process.stdout.write(`   Checking ${executor.displayName}... `);
        
        if (executor.isInstalled()) {
          available.push(executor);
          console.log('✓');
        } else {
          console.log('✗');
        }
      } catch (error) {
        console.log(`✗ (error: ${error.message})`);
      }
    }
    
    return available;
  }

  /**
   * Get detailed status of all executors with timeout protection
   * @returns {object[]}
   */
  getExecutorStatus() {
    return this.executors.map(executor => {
      try {
        const installed = executor.isInstalled();
        const authStatus = installed ? executor.checkAuth() : { authenticated: false, message: 'Not installed' };
        
        return {
          name: executor.name,
          displayName: executor.displayName,
          installed,
          authenticated: authStatus.authenticated,
          status: authStatus.message,
          ready: installed && authStatus.authenticated
        };
      } catch (error) {
        return {
          name: executor.name,
          displayName: executor.displayName,
          installed: false,
          authenticated: false,
          status: `Error: ${error.message}`,
          ready: false
        };
      }
    });
  }
}

module.exports = {
  AIExecutor,
  ClaudeExecutor,
  CopilotExecutor,
  GeminiExecutor,
  CodexExecutor,
  AIExecutorFactory
};
