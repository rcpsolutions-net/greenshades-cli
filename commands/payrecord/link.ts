import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';

export function createPayrecordLinkCommand(): Command {
  const link = new Command('link <pay-record-id>')
    .description('Get a one-use authorization link for accessing a pay record')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'json');

  link.action(async (payRecordId: string, options: any) => {
    try {
      console.log(chalk.blue(`Fetching authorization link for pay record ${payRecordId}...`));

      const response = await apiClient.get(`/payroll/pay-records/${payRecordId}/link`);

      if (options?.output === 'table') {
        if (typeof response.data === 'object' && response.data !== null) {
          const formattedData = Object.entries(response.data).map(([key, value]) => ({
            Field: key,
            Value: typeof value === 'object' && value !== null ? JSON.stringify(value) : value,
          }));
          console.table(formattedData);
        }
      } else {
        console.log(chalk.blueBright('Authorization link response:\n'));
        console.log(JSON.stringify(response.data, null, 2));
      }

      console.log(chalk.green(`✅ Successfully retrieved pay record link for ${payRecordId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching pay record link ${payRecordId}:`, error.message));
      process.exit(1);
    }
  });

  return link;
}
