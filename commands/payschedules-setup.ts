import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createPaySchedulesSetupCommands() {
  const payschedules = new Command('payschedules-setup')
    .description('Workspace-level pay schedule management (list, details, employee assignments)');

  // --- PAY SCHEDULE LIST (GET /payroll/payschedules) ---
  payschedules.command('list')
    .description('Get all pay schedules for the workspace')
    .action(async () => {
      try {
        console.log(chalk.blue('--- Fetching all pay schedules...'));

        const response = await apiClient.get('/payroll/payschedules');

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved pay schedules.'));
      } catch (error: any) {
        console.error(chalk.red('Error fetching pay schedules:', error.message));
        process.exit(1);
      }
    });

  // --- PAY SCHEDULE DETAILS (GET /payroll/payschedules/{id}) ---
  payschedules.command('details <schedule-id>')
    .description('Get a single pay schedule by its Greenshades ID')
    .action(async (scheduleId) => {
      try {
        console.log(chalk.blue(`Fetching pay schedule: ${scheduleId}...`));

        const response = await apiClient.get(`/payroll/payschedules/${scheduleId}`);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully retrieved pay schedule ${scheduleId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching pay schedule ${scheduleId}:`, error.message));
        process.exit(1);
      }
    });

  // --- PAY SCHEDULE EMPLOYEES (GET /payroll/pay-runs/{id}/employees) ---
  // Note: Despite being classified under "Payroll: Setup" in api_endpoints.json,
  // this endpoint actually lives at /payroll/pay-runs/{id}/employees.
  payschedules.command('employees <schedule-id>')
    .description('Get all employees assigned to the given pay schedule / pay run')
    .action(async (scheduleId) => {
      try {
        console.log(chalk.blue(`Fetching employees for pay schedule: ${scheduleId}...`));

        const response = await apiClient.get(`/payroll/pay-runs/${scheduleId}/employees`);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully retrieved employees for pay schedule ${scheduleId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching employees for pay schedule ${scheduleId}:`, error.message));
        process.exit(1);
      }
    });

  return payschedules;
}

export default createPaySchedulesSetupCommands;
