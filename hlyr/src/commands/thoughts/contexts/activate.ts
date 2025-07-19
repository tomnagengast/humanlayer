import chalk from 'chalk'
import { execSync } from 'child_process'
import { loadThoughtsConfig, saveThoughtsConfig, expandPath } from '../../../thoughtsConfig.js'

interface ActivateOptions {
  configFile?: string
}

export async function contextsActivateCommand(name: string, options: ActivateOptions): Promise<void> {
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

    // Check if already active
    if (config.activeContext === name) {
      console.log(chalk.yellow(`Context '${name}' is already active`))
      return
    }

    // Update active context
    config.activeContext = name
    saveThoughtsConfig(config, options)

    // Configure git remote
    const thoughtsRepo = expandPath(config.thoughtsRepo)

    try {
      // Check if remote exists
      execSync(`git remote get-url ${context.remoteName}`, {
        cwd: thoughtsRepo,
        stdio: 'pipe',
      })
      // Update URL if it exists
      execSync(`git remote set-url ${context.remoteName} ${context.remoteUrl}`, {
        cwd: thoughtsRepo,
        stdio: 'pipe',
      })
      console.log(chalk.gray(`✓ Updated git remote '${context.remoteName}'`))
    } catch {
      // Add remote if it doesn't exist
      try {
        execSync(`git remote add ${context.remoteName} ${context.remoteUrl}`, {
          cwd: thoughtsRepo,
          stdio: 'pipe',
        })
        console.log(chalk.gray(`✓ Added git remote '${context.remoteName}'`))
      } catch (error) {
        console.error(chalk.yellow(`Warning: Could not configure git remote: ${error}`))
        console.error(chalk.gray(`You may need to configure it manually in ${thoughtsRepo}`))
      }
    }

    console.log(chalk.green(`✅ Activated context '${name}'`))
    console.log(`  Remote URL: ${chalk.gray(context.remoteUrl)}`)
    console.log(`  Remote Name: ${chalk.gray(context.remoteName)}`)
    console.log('')
    console.log(chalk.gray('Your thoughts will now sync to this remote when you run:'))
    console.log(chalk.cyan('humanlayer thoughts sync'))
  } catch (error) {
    console.error(chalk.red(`Error activating context: ${error}`))
    process.exit(1)
  }
}
