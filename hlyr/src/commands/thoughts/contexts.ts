import { Command } from 'commander'
import { contextsListCommand } from './contexts/list.js'
import { contextsCreateCommand } from './contexts/create.js'
import { contextsActivateCommand } from './contexts/activate.js'
import { contextsRemoveCommand } from './contexts/remove.js'
import { contextsRenameCommand } from './contexts/rename.js'

export function createContextsCommand(): Command {
  const contexts = new Command('contexts').description(
    'Manage thoughts contexts for different git remotes',
  )

  contexts
    .command('list')
    .description('List all contexts')
    .option('--json', 'Output in JSON format')
    .option('--config-file <path>', 'Path to config file')
    .action(contextsListCommand)

  contexts
    .command('create <name>')
    .description('Create a new context')
    .option('--remote-url <url>', 'Git remote URL for this context')
    .option('--config-file <path>', 'Path to config file')
    .action(contextsCreateCommand)

  contexts
    .command('activate <name>')
    .description('Switch to a different context')
    .option('--config-file <path>', 'Path to config file')
    .action(contextsActivateCommand)

  contexts
    .command('remove <name>')
    .description('Remove a context')
    .option('--config-file <path>', 'Path to config file')
    .action(contextsRemoveCommand)

  contexts
    .command('rename <oldName> <newName>')
    .description('Rename a context')
    .option('--config-file <path>', 'Path to config file')
    .action(contextsRenameCommand)

  return contexts
}
