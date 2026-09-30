import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import apiClient from '../../lib/api.ts';
import { formatErrorMessage } from './helpers.ts';

export function createDirectDepositDeleteCommand(): Command {
  const del = new Command('delete')
    .alias('clear')
    .alias('del')
    .description("Delete an employee's direct deposit settings (clears all accounts)")
    .option('-y, --yes', 'Skip confirmation prompt', false)
    .option('--force', 'Skip confirmation prompt', false);

  del.action(async (employeeId: string, options: { yes: boolean; force: boolean }) => {
    try {
      const skipPrompt = options.yes || options.force;

      if (!skipPrompt) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete all direct deposit settings for employee ${chalk.cyan(employeeId)}?`,
            default: false
          }
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Operation cancelled.'));
          return;
        }
      }

      console.log(chalk.blue(`Deleting direct deposit settings for employee ${chalk.cyan(employeeId)}...`));

      await apiClient.delete(`/employees/${encodeURIComponent(employeeId)}/directdeposit`);

      console.log(chalk.green(`✅ Successfully deleted all direct deposit accounts for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error deleting direct deposit settings for employee ${employeeId}:`, formatErrorMessage(error)));
      process.exit(1);
    }
  });

  return del;
}
