import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createEarningCommands() {
  const earnings = new Command('earnings')
    .description('Workspace-level payroll earning code management (list, details, create, update, delete)');

  // --- EARNINGS LIST (GET /payroll/earnings) ---
  earnings.command('list')
    .description('Get all earning codes for the workspace')
    .action(async () => {
      try {
        console.log(chalk.blue('--- Fetching all earning codes...'));

        const response = await apiClient.get('/payroll/earnings');

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved earning codes.'));
      } catch (error: any) {
        console.error(chalk.red('Error fetching earning codes:', error.message));
        process.exit(1);
      }
    });

  // --- EARNINGS DETAILS (GET /payroll/earnings/{code}) ---
  earnings.command('details <earning-code>')
    .description('Get a single earning code by its Greenshades earning code')
    .action(async (earningCode) => {
      try {
        console.log(chalk.blue(`Fetching earning code: ${earningCode}...`));

        const response = await apiClient.get(`/payroll/earnings/${earningCode}`);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully retrieved earning code ${earningCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching earning code ${earningCode}:`, error.message));
        process.exit(1);
      }
    });

  // --- EARNINGS CREATE (POST /payroll/earnings) ---
  earnings.command('create')
    .description('Create a new earning code')
    .option('-f, --file <filePath>', 'Path to JSON file with PayrollEarning object')
    .option('-d, --data <jsonData>', 'Raw JSON string of PayrollEarning object')
    .action(async (options: any) => {
      try {
        let earningData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          earningData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          earningData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue('Creating new earning code...'));
        const response = await apiClient.post('/payroll/earnings', earningData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully created earning code.'));
      } catch (error: any) {
        console.error(chalk.red('Error creating earning code:', error.message));
        process.exit(1);
      }
    });

  // --- EARNINGS UPDATE (PUT /payroll/earnings/{code}) ---
  earnings.command('update <earning-code>')
    .description('Modify an existing earning code')
    .option('-f, --file <filePath>', 'Path to JSON file with PayrollEarning object')
    .option('-d, --data <jsonData>', 'Raw JSON string of PayrollEarning object')
    .action(async (earningCode: string, options: any) => {
      try {
        let earningData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          earningData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          earningData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        if (earningData.code && earningData.code !== earningCode) {
          console.error(chalk.red(`Mismatch: CLI arg (${earningCode}) does not match body code (${earningData.code}).`));
          process.exit(1);
        }
        earningData.code = earningCode;

        console.log(chalk.blue(`Updating earning code ${earningCode}...`));
        await apiClient.put(`/payroll/earnings/${earningCode}`, earningData);

        console.log(chalk.green(`✅ Successfully updated earning code ${earningCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating earning code ${earningCode}:`, error.message));
        process.exit(1);
      }
    });

  // --- EARNINGS DELETE (DELETE /payroll/earnings/{code}) ---
  earnings.command('delete <earning-code>')
    .description('Remove an existing earning code')
    .action(async (earningCode) => {
      try {
        console.log(chalk.blue(`Deleting earning code ${earningCode}...`));

        await apiClient.delete(`/payroll/earnings/${earningCode}`);
        console.log(chalk.green(`✅ Successfully deleted earning code ${earningCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting earning code ${earningCode}:`, error.message));
        process.exit(1);
      }
    });

  return earnings;
}

export default createEarningCommands;
