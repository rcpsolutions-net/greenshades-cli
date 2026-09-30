import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import { formatErrorMessage } from './helpers.ts';

export function createDirectDepositGetCommand(): Command {
  const get = new Command('get')
    .alias('pull')
    .description("Get an employee's direct deposit settings")
    .option('-o, --output <output>', 'Specify output format (table, json)', 'table');

  get.action(async (employeeId: string, options: { output: string }) => {
    try {
      console.log(chalk.blue(`Fetching direct deposit settings for employee ${chalk.cyan(employeeId)}...`));

      const response = await apiClient.get(`/employees/${encodeURIComponent(employeeId)}/directdeposit`);
      const data = response.data;

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log(chalk.yellow(`No direct deposit accounts configured for employee ${employeeId}.`));
        return;
      }

      if (options.output === 'json') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.table(data);
      }

      console.log(chalk.green(`✅ Successfully retrieved direct deposit settings for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching direct deposit settings for employee ${employeeId}:`, formatErrorMessage(error)));
      process.exit(1);
    }
  });

  return get;
}
