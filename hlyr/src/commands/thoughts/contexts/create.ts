import chalk from 'chalk'
import readline from 'readline'
import { loadThoughtsConfig, saveThoughtsConfig, addContext } from '../../../thoughtsConfig.js'

interface CreateOptions {
  remoteUrl?: string
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

export async function contextsCreateCommand(name: string, options: CreateOptions): Promise<void> {
  try {
    const config = loadThoughtsConfig(options)

    if (!config) {
      console.error(chalk.red('Error: Thoughts not configured. Run "humanlayer thoughts init" first.'))
      process.exit(1)
    }

    // Check if context already exists
    if (config.contexts?.find(c => c.name === name)) {
      console.error(chalk.red(`Error: Context '${name}' already exists`))
      console.error(chalk.gray('Use "humanlayer thoughts contexts list" to see existing contexts'))
      process.exit(1)
    }

    // Get remote URL if not provided
    let remoteUrl = options.remoteUrl
    if (!remoteUrl) {
      console.log(chalk.blue(`Creating context '${name}'`))
      console.log('')
      remoteUrl = await prompt('Git remote URL for this context: ')

      if (!remoteUrl) {
        console.error(chalk.red('Error: Remote URL is required'))
        process.exit(1)
      }
    }

    // Generate remote name (use context name as remote name)
    const remoteName = name.replace(/[^a-zA-Z0-9_-]/g, '_')

    // Add the context
    addContext(config, {
      name,
      remoteUrl,
      remoteName,
    })

    // If this is the first context, make it active
    if (!config.contexts || config.contexts.length === 1) {
      config.activeContext = name
    }

    // Save configuration
    saveThoughtsConfig(config, options)

    console.log(chalk.green(`✅ Created context '${name}'`))
    console.log(`  Remote URL: ${chalk.gray(remoteUrl)}`)
    console.log(`  Remote Name: ${chalk.gray(remoteName)}`)

    if (config.activeContext === name) {
      console.log(chalk.green(`✅ Set as active context`))
    } else {
      console.log('')
      console.log(chalk.gray(`To activate this context, run:`))
      console.log(chalk.cyan(`humanlayer thoughts contexts activate ${name}`))
    }
  } catch (error) {
    console.error(chalk.red(`Error creating context: ${error}`))
    process.exit(1)
  }
}
