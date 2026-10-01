import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createTaxSetupCommands() {
  const taxSetup = new Command('tax-setup')
    .description('Workspace-level payroll tax setup information');

  // --- TAX INFO (GET /payroll/tax-setup) ---
  // Docs page unavailable at developer portal — generic GET with JSON output.
  taxSetup.command('info')
    .description('Get workspace payroll tax setup information')
    .action(async () => {
      try {
        console.log(chalk.blue('--- Fetching tax setup information...'));

        const response = await apiClient.get('/payroll/tax-setup');

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved tax setup information.'));
      } catch (error: any) {
        console.error(chalk.red('Error fetching tax setup information:', error.message));
        process.exit(1);
      }
    });

  return taxSetup;
}

export default createTaxSetupCommands;
