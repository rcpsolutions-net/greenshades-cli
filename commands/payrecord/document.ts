import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';

export function createPayrecordDocumentCommand(): Command {
  const document = new Command('document <pay-record-id>')
    .description('Get the pay document (PDF) for a specific pay record');

  document.action(async (payRecordId: string) => {
    try {
      console.log(chalk.blue(`Fetching pay document for pay record ${payRecordId}...`));

      const response = await apiClient.get(`/payroll/pay-records/${payRecordId}/document`, {
        responseType: 'arraybuffer',
      });

      console.log(chalk.blueBright('Pay document retrieved successfully.'));
      console.log('Content-Type:', response.headers['content-type'] || 'unknown');
      console.log('Response size:', (response.data as Buffer).length, 'bytes');
      
      if (typeof response.data === 'object' && response.data !== null) {
        console.log(JSON.stringify(response.data, null, 2));
      }

      console.log(chalk.green(`✅ Successfully retrieved pay document for ${payRecordId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching pay document for ${payRecordId}:`, error.message));
      process.exit(1);
    }
  });

  return document;
}
