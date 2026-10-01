import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import config from '../../lib/config.js';
import { subDays, format } from 'date-fns';
import { writeFileSync } from 'node:fs';

export function createCostReportCommand(): Command {
  const costs = new Command('costs')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'json')
    .option('-s, --start-date <startDate>', 'Start date for the report (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'End date for the report (YYYY-MM-DD)')
    .option('-p, --pay-run <payRunId>', 'Build the report for a single pay run (instead of a date range)')
    .description('Get cost report for the workspace within a specified date range, or for a single pay run');

  costs.action(async (options: any) => {
    console.log(chalk.blue('Fetching cost report with options:', Object.keys(options)));

    try {
      const workspaceId = config.get('GsWorkspaceId');

      let response;
      let outputFilename: string;

      if (options.payRun) {
        console.log(chalk.blue(`Fetching cost report for pay run ${options.payRun} (workspace ${workspaceId})`));
        response = await apiClient.get(`/payroll/reports/pay-runs/${options.payRun}/cost`).catch((error: any) => {
          console.error(chalk.red('Error fetching cost report data:', error.message));
          process.exit(1);
        });
        outputFilename = `cost-report-payrun-${options.payRun}.json`;
      } else {
        const startDate = options.startDate ? new Date(options.startDate) : subDays(new Date(), 5);
        const endDate = options.endDate ? new Date(options.endDate) : new Date();

        console.log(chalk.blue(`Fetching all cost report data for workspace ${workspaceId}`));

        response = await apiClient.get('/payroll/reports/cost', {
          params: {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
          }
        }).catch((error: any) => {
          console.error(chalk.red('Error fetching cost report data:', error.message));
          process.exit(1);
        });

        outputFilename = `cost-report-${format(startDate, 'yyyy-MM-dd')}.json`;
      }

      const allRecords = response.data;
      console.log(`(first) Received ${response.data.length} records. Total: ${allRecords.length}.`);

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
        return console.log(chalk.green('✅ Successfully retrieved cost report data in table format.'));
      } else {
        writeFileSync(outputFilename, JSON.stringify(allRecords, null, 2));
        console.log(chalk.green(`✅ Successfully wrote cost report data to file: ${outputFilename}`));
      }

    } catch (error: any) {
      console.error(chalk.red('Error fetching cost report data:', error.message));
      process.exit(1);
    }
  });

  return costs;
}
