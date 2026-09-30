import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import config from '../../lib/config.js';
import { subDays, format } from 'date-fns';

export function createBenefitsDeductionsCommand(): Command {
  const benefitsDeductions = new Command('benefits-deductions')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'json')
    .option('-s, --start-date <startDate>', 'Start date for the report (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'End date for the report (YYYY-MM-DD)')
    .description('Get all benefits deductions for the workspace');

  benefitsDeductions.action(async (options: any) => {
    console.log(chalk.blue('Fetching benefits deductions with options:', Object.keys(options)));

    try {
      const workspaceId = config.get('GsWorkspaceId');
      const pageSize = 2000;

      let currentPage = 1;
      let lastPage = false;
      const allRecords: any[] = [];
      let totalAnomalyCount = 0;
      const startDate = options.startDate ? new Date(options.startDate) : subDays(new Date(), 1);
      const endDate = options.endDate ? new Date(options.endDate) : new Date();

      console.log(chalk.blue(`Fetching all benefits deductions for workspace ${workspaceId}`));

      const response = await apiClient.get('/payroll/reports/benefits-deductions', {
        params: {
          pageSize,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          after: null,
        }
      }).catch((error: any) => {
        console.error(chalk.red('Error fetching benefits deductions:', error.message));
        process.exit(1);
      });

      const GsCursor = response.headers['x-gs-cursor'] || response.headers['X-GS-CURSOR'];
      allRecords.push(...response.data);

      console.log(`(first) Received ${response.data.length} records. Total: ${allRecords.length}. X-GS-CURSOR: ${GsCursor ?? '(none)'}`);

      if (GsCursor) currentPage++;
      else lastPage = true;

      const outputFilename = `benefits-deductions-${format(startDate, 'yyyy-MM-dd')}.json`;

      while (!lastPage) {
        console.log(chalk.blue(`Fetching page ${currentPage} of benefits deductions...`));

        const pageResponse = await apiClient.get('/payroll/reports/benefits-deductions', {
          params: {
            pageSize,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            after: GsCursor,
          }
        }).catch((error: any) => {
          console.error(chalk.red(`Error fetching page ${currentPage} of benefits deductions:`, error.message));
          process.exit(1);
        });

        const allRecordsCountBefore = allRecords.length;
        const newRecords = pageResponse.data.filter(() => true);

        allRecords.push(...newRecords);
        const newGsCursor = pageResponse.headers['x-gs-cursor'] || pageResponse.headers['X-GS-CURSOR'];

        console.log(`${currentPage}: Received ${pageResponse.data.length} records. Total: ${allRecords.length}. X-GS-CURSOR: ${newGsCursor ?? '(none)'}`);
        const allRecordsCountAfter = allRecords.length;

        writeFileSync(outputFilename, JSON.stringify(allRecords, null, 2));

        if (allRecordsCountBefore === allRecordsCountAfter && newGsCursor) {
          totalAnomalyCount++;
          console.log(chalk.yellow(`⚠️  Warning: No new records found on page ${currentPage}, possible duplicate page.`));
          if (totalAnomalyCount > 2) break;
        }

        if (!newGsCursor) {
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
        writeFileSync(outputFilename, JSON.stringify(allRecords, null, 2));
        console.log(chalk.green(`✅ Successfully wrote paystubs to file: ${outputFilename}`));
      }

    } catch (error: any) {
      console.error(chalk.red('Error fetching paystubs:', error.message));
      process.exit(1);
    }
  });

  return benefitsDeductions;
}
