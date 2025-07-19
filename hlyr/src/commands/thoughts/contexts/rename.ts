import chalk from 'chalk'
import { execSync } from 'child_process'
import { loadThoughtsConfig, saveThoughtsConfig, expandPath } from '../../../thoughtsConfig.js'

interface RenameOptions {
  configFile?: string
}

export async function contextsRenameCommand(
  oldName: string,
  newName: string,
  options: RenameOptions,
): Promise<void> {
  try {
    const config = loadThoughtsConfig(options)

    if (!config) {
      console.error(chalk.red('Error: Thoughts not configured. Run "humanlayer thoughts init" first.'))
      process.exit(1)
    }

    // Check if old context exists
    const context = config.contexts?.find(c => c.name === oldName)
    if (!context) {
      console.error(chalk.red(`Error: Context '${oldName}' not found`))
      console.error(chalk.gray('Use "humanlayer thoughts contexts list" to see available contexts'))
      process.exit(1)
    }

    // Check if new name already exists
    if (config.contexts?.find(c => c.name === newName)) {
      console.error(chalk.red(`Error: Context '${newName}' already exists`))
      process.exit(1)
    }

    // Update context name
    context.name = newName

    // Generate new remote name
    const oldRemoteName = context.remoteName
    const newRemoteName = newName.replace(/[^a-zA-Z0-9_-]/g, '_')
    context.remoteName = newRemoteName

    // Update active context if needed
    if (config.activeContext === oldName) {
      config.activeContext = newName
    }

    // Save configuration
    saveThoughtsConfig(config, options)

    // Try to rename git remote
    const thoughtsRepo = expandPath(config.thoughtsRepo)
    if (oldRemoteName !== newRemoteName) {
      try {
        // Check if old remote exists
        execSync(`git remote get-url ${oldRemoteName}`, {
          cwd: thoughtsRepo,
          stdio: 'pipe',
        })

        // Rename the remote
        execSync(`git remote rename ${oldRemoteName} ${newRemoteName}`, {
          cwd: thoughtsRepo,
          stdio: 'pipe',
        })
        console.log(chalk.gray(`✓ Renamed git remote '${oldRemoteName}' to '${newRemoteName}'`))
      } catch {
        // Remote might not exist
        console.log(chalk.gray(`Note: Could not rename git remote '${oldRemoteName}'`))
      }
    }

    console.log(chalk.green(`✅ Renamed context '${oldName}' to '${newName}'`))

    if (config.activeContext === newName) {
      console.log(chalk.gray(`(active context)`))
    }
  } catch (error) {
    console.error(chalk.red(`Error renaming context: ${error}`))
    process.exit(1)
  }
}
