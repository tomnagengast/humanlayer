import chalk from 'chalk'
import readline from 'readline'
import { execSync } from 'child_process'
import {
  loadThoughtsConfig,
  saveThoughtsConfig,
  removeContext,
  expandPath,
} from '../../../thoughtsConfig.js'

interface RemoveOptions {
  configFile?: string
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

export async function contextsRemoveCommand(name: string, options: RemoveOptions): Promise<void> {
  try {
    const config = loadThoughtsConfig(options)

    if (!config) {
      console.error(chalk.red('Error: Thoughts not configured. Run "humanlayer thoughts init" first.'))
      process.exit(1)
    }

    // Check if context exists
    const context = config.contexts?.find(c => c.name === name)
    if (!context) {
      console.error(chalk.red(`Error: Context '${name}' not found`))
      console.error(chalk.gray('Use "humanlayer thoughts contexts list" to see available contexts'))
      process.exit(1)
    }

    // Confirm removal
    const isActive = config.activeContext === name
    if (isActive) {
      console.log(chalk.yellow(`Warning: '${name}' is the active context`))
    }

    const confirm = await prompt(`Are you sure you want to remove context '${name}'? (y/N): `)
    if (confirm.toLowerCase() !== 'y') {
      console.log('Removal cancelled.')
      return
    }

    // Remove the context
    removeContext(config, name)
    saveThoughtsConfig(config, options)

    // Try to remove git remote
    const thoughtsRepo = expandPath(config.thoughtsRepo)
    try {
      execSync(`git remote remove ${context.remoteName}`, {
        cwd: thoughtsRepo,
        stdio: 'pipe',
      })
      console.log(chalk.gray(`✓ Removed git remote '${context.remoteName}'`))
    } catch {
      // Remote might not exist or we might not have permissions
      console.log(chalk.gray(`Note: Could not remove git remote '${context.remoteName}'`))
    }

    console.log(chalk.green(`✅ Removed context '${name}'`))

    if (isActive) {
      console.log(chalk.yellow('⚠️  No active context now'))
      console.log(chalk.gray('Activate another context with:'))
      console.log(chalk.cyan('humanlayer thoughts contexts activate <name>'))
    }
  } catch (error) {
    console.error(chalk.red(`Error removing context: ${error}`))
    process.exit(1)
  }
}
