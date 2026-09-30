import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import config from '../../lib/config.js';
import { subDays, addDays, endOfDay, startOfDay, format } from 'date-fns';
import { writeFileSync } from 'node:fs';
import { fetchPaginated } from '../reports/shared.ts';

export function createPaystubsListCommand(): Command {
  const list = new Command('list')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'json')
    .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)')
    .description('Get all paystubs for the workspace within startDate and endDate, defaults to the last 1 day');

  list.action(async (options: any) => {
    console.log(chalk.blue('Fetching paystubs with options:', Object.keys(options)));

    try {
      const startDate = options?.startDate ? addDays(startOfDay(new Date(options.startDate)), 1) : startOfDay(subDays(new Date(), 1));
      const endDate = options?.endDate ? addDays(endOfDay(new Date(options.endDate)), 1) : endOfDay(new Date());

      const workspaceId = config.get('GsWorkspaceId');
      const pageSize = 2000;

      let currentPage = 1;
      let lastPage = false;
      const allRecords: any[] = [];
      let totalAnomalyCount = 0;

      console.log(chalk.blue(`Fetching all paystubs for workspace ${workspaceId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}...`));

      const response = await apiClient.get('/pay-records', {
        params: {
          pageSize,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        }
      }).catch((error: any) => {
        console.error(chalk.red('Error fetching paystubs:', error.message));
        process.exit(1);
      });

      let GsCursor = response.headers['x-gs-cursor'] || response.headers['X-GS-CURSOR'];

      allRecords.push(...response.data);

      console.log('(first) Received ' + response.data.length + ' records. ' + allRecords.length + ' records total. ' + 'X-GS-CURSOR response:', GsCursor ?? '(none)');

      if (GsCursor) currentPage++;
      else lastPage = true;

      const outputFile = `paystubs-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.json`;

      while (!lastPage) {
        console.log(chalk.blue(`Fetching page ${currentPage} of paystubs...`));

        const pageResponse = await apiClient.get('/pay-records', {
          params: {
            pageSize,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            after: GsCursor,
          }
        }).catch((error: any) => {
          console.error(chalk.red(`Error fetching page ${currentPage} of paystubs:`, error.message + ' -- X-GS-CURSOR was: ' + GsCursor + '\n' + JSON.stringify(error, null, 2)));
          process.exit(1);
        });

        let allRecordsCountBefore = allRecords.length;

        let newRecords = pageResponse.data.filter((record: any) => {
          return true;
        });

        allRecords.push(...newRecords);

        GsCursor = pageResponse.headers['x-gs-cursor'] || pageResponse.headers['X-GS-CURSOR'];

        console.log(currentPage + ': Received ' + pageResponse.data.length + ' records. ' + allRecords.length + ' records total. ' + 'X-GS-CURSOR response:', GsCursor ?? '(none)');

        let allRecordsCountAfter = allRecords.length;

        writeFileSync(outputFile, JSON.stringify(allRecords, null, 2));

        if (allRecordsCountBefore === allRecordsCountAfter && GsCursor) {
          totalAnomalyCount++;
          console.log(chalk.yellow(`⚠️  Warning: No new records found on page ${currentPage}, possible duplicate page.`));
          if (totalAnomalyCount > 2) break;
        }

        if (!GsCursor) {
          lastPage = true;
        } else {
          currentPage++;
        }
      }

      if (options?.output === 'table') {
        const formattedData = allRecords.map((record: any) => ({
          id: record.id,
          EmployeeId: record.employeeID,
          RecordType: record.recordType,
          PayRunId: record.payRunId,
          CheckDate: record.checkDate,
          GrossPay: record.grossWages,
          NetPay: record.netWages,
          TotalDeductions: record.totalDeductions,
          TotalTax: record.totalTaxes,
          CheckNumber: record.checkNumber,
          TaxingEntityTotal: record.taxes.length,
        }));

        console.table(formattedData);
        return console.log(chalk.green('✅ Successfully retrieved paystubs in table format.'));
      } else {
        writeFileSync(outputFile, JSON.stringify(allRecords, null, 2));
        console.log(chalk.green(`✅ Successfully wrote paystubs to file: ${outputFile}`));
      }

    } catch (error: any) {
      console.error(chalk.red('Error fetching paystubs:', error.message));
      process.exit(1);
    }
  });

  return list;
}
