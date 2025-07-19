import chalk from 'chalk'
import { loadThoughtsConfig } from '../../../thoughtsConfig.js'

interface ListOptions {
  json?: boolean
  configFile?: string
}

export async function contextsListCommand(options: ListOptions): Promise<void> {
  try {
    const config = loadThoughtsConfig(options)

    if (!config) {
      console.error(chalk.red('Error: Thoughts not configured. Run "humanlayer thoughts init" first.'))
      process.exit(1)
    }

    const contexts = config.contexts || []
    const activeContext = config.activeContext

    // Handle JSON output
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            contexts: contexts.map(c => ({
              ...c,
              active: c.name === activeContext,
            })),
            activeContext,
          },
          null,
          2,
        ),
      )
      return
    }

    // Handle empty contexts
    if (contexts.length === 0) {
      console.log(chalk.yellow('No contexts configured yet.'))
      console.log(
        chalk.gray('Create one with: humanlayer thoughts contexts create <name> --remote-url <url>'),
      )
      return
    }

    // Display contexts
    console.log(chalk.blue('Thoughts Contexts'))
    console.log(chalk.gray('='.repeat(50)))
    console.log('')

    contexts.forEach(context => {
      const isActive = context.name === activeContext
      const marker = isActive ? chalk.green('*') : ' '
      const name = isActive ? chalk.green(context.name) : chalk.cyan(context.name)

      console.log(`${marker} ${name}`)
      console.log(`  Remote URL: ${chalk.gray(context.remoteUrl)}`)
      console.log(`  Remote Name: ${chalk.gray(context.remoteName)}`)
      console.log('')
    })

    if (!activeContext) {
      console.log(chalk.yellow('No active context. Activate one with:'))
      console.log(chalk.gray('humanlayer thoughts contexts activate <name>'))
    }
  } catch (error) {
    console.error(chalk.red(`Error listing contexts: ${error}`))
    process.exit(1)
  }
}
