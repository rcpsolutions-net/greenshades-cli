import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import config from '../../lib/config.js';

export function createPaystubsPayrunCommand(): Command {
  const payrun = new Command('payrun <payRunId>')
    .description('Get all pay-records for a specific pay-run id')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
    .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)');

  payrun.action(async (payRunId: string, options: any) => {
    try {
      const workspaceId = config.get('GsWorkspaceId');

      console.log(chalk.blue(`Fetching pay-records for pay-run with Id: ${payRunId} in workspace ${workspaceId}`));

      const response = await apiClient.get(`/payroll/pay-runs/${payRunId}/pay-records`);

      if (options?.output === 'table') {
        console.table(response.data);
        return console.log(chalk.green('✅ Successfully retrieved pay-records in table format.'));
      } else {
        console.log(chalk.blueBright('Outputting pay-records in JSON format:\n'));
        console.log(JSON.stringify(response.data, null, 2));
      }

      console.log(chalk.green(`✅ Successfully retrieved pay-records for pay-run ${payRunId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching pay-records for pay-run ${payRunId}:`, error.message));
      process.exit(1);
    }
  });

  return payrun;
}
