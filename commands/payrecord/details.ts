import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';

export function createPaystubsDetailsCommand(): Command {
  const details = new Command('details <pay-record-id>')
    .description('Get a single paystub by its payRecordId')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
    .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)');

  details.action(async (payRecordId: string, options: any) => {
    try {
      console.log(chalk.blue(`Fetching paystub with Id: ${payRecordId}...`));

      const response = await apiClient.get(`/payroll/pay-records/${payRecordId}`);

      if (options?.output === 'table') {
        if (typeof response.data === 'object' && response.data !== null) {
          const formattedData = Object.entries(response.data).map(([key, value]) => ({
            Field: key,
            Value: typeof value === 'object' && value !== null ? JSON.stringify(value) : value,
          }));
          console.table(formattedData);
        }
      } else {
        console.log(chalk.blueBright('Outputting paystub in JSON format:\n'));
        console.log(JSON.stringify(response.data, null, 2));
      }

      console.log(chalk.green(`✅ Successfully retrieved paystub ${payRecordId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching paystub ${payRecordId}:`, error.message));
      process.exit(1);
    }
  });

  return details;
}
