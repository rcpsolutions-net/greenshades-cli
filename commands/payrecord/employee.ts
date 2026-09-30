import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import config from '../../lib/config.js';
import { startOfDay, endOfDay, format, subDays } from 'date-fns';

export function createPaystubsEmployeeCommand(): Command {
  const employee = new Command('employee <employeeId>')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
    .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)')
    .description('Get all paystubs for a specific employee');

  employee.action(async (employeeId: string, options: any) => {
    try {
      const startDate = options?.startDate ? startOfDay(new Date(options.startDate)) : startOfDay(subDays(new Date(), 2));
      const endDate = options?.endDate ? endOfDay(new Date(options.endDate)) : endOfDay(new Date());
      const workspaceId = config.get('GsWorkspaceId');

      console.log(chalk.blue(`Fetching paystubs for employee with Id: ${employeeId} in workspace ${workspaceId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}...`));

      const response = await apiClient.get(`/employees/${employeeId}/pay-records`, {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        }
      });

      if (options?.output === 'table') {
        console.table(response.data);
        return console.log(chalk.green('✅ Successfully retrieved pay-records in table format.'));
      } else {
        console.log(chalk.blueBright('Outputting pay-records in JSON format:\n'));
        console.log(JSON.stringify(response.data, null, 2));
      }

      console.log(chalk.green(`✅ Successfully retrieved pay-records for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching pay-records for employee ${employeeId}:`, error.message));
      process.exit(1);
    }
  });

  return employee;
}

