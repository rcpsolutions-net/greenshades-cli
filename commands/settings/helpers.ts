import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../../lib/api.ts';
import config from '../../lib/config.js';

function outputResult(data: any, format: string): void {
  if (format === 'table') {
    console.table(data);
    console.log(chalk.green('✅ Successfully retrieved data in table format.'));
  } else {
    console.log(chalk.blueBright('Outputting data in JSON format:\n'));
    console.log(JSON.stringify(data, null, 2));
  }
}

export function createPayDetailsCommand(): Command {
  const cmd = new Command('pay-details <employeeId>')
    .description('Get details for a specific employee\'s payroll direct deposit setting.')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table');

  cmd.action(async (employeeId: string, options: any) => {
    try {
      const workspaceId = config.get('GsWorkspaceId');
      console.log(chalk.cyanBright(`Fetching payroll details for employee with Id: ${employeeId} in workspace ${workspaceId}...`));

      const response = await apiClient.get(`/employees/${employeeId}/directdeposit`);
      outputResult(response.data, options?.output || 'table');
      console.log(chalk.green('✅ Successfully retrieved payroll details.'));
    } catch (error: any) {
      console.error(chalk.red('Error fetching payroll details:', error.message));
      process.exit(1);
    }
  });

  return cmd;
}

export function createEarnCodesCommand(): Command {
  const cmd = new Command('earn-codes <employeeId>')
    .description("Get an employee's earn codes for payroll settings.")
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table');

  cmd.action(async (employeeId: string, options: any) => {
    try {
      console.log(chalk.blue(`Fetching earn codes for employee with Id: ${employeeId}...`));

      const response = await apiClient.get(`/employees/${employeeId}/payroll/earnings`);
      outputResult(response.data, options?.output || 'table');
      console.log(chalk.green(`✅ Successfully retrieved earn codes for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching earn codes for employee ${employeeId}:`, error.message));
      process.exit(1);
    }
  });

  return cmd;
}

export function createTaxDetailsCommand(): Command {
  const cmd = new Command('tax-details <employeeId>')
    .description('Get all tax details for a specific employee')
    .option('-t, --taxid <taxid>', 'Specify a specific tax code to retrieve details for (optional)', 'SS')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table');

  cmd.action(async (employeeId: string, options: any) => {
    try {
      const workspaceId = config.get('GsWorkspaceId');
      console.log(chalk.blueBright(`Fetching tax details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

      const response = await apiClient.get(`/payroll/taxes`);
      outputResult(response.data, options?.output || 'table');
      console.log(chalk.green(`✅ Successfully retrieved tax details for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching tax details for employee ${employeeId}:`, error.message));
      process.exit(1);
    }
  });

  return cmd;
}

export function createPayScheduleCommand(): Command {
  const cmd = new Command('pay-schedule <employeeId>')
    .description('Get all pay-schedules for a specific employee')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table');

  cmd.action(async (employeeId: string, options: any) => {
    try {
      const workspaceId = config.get('GsWorkspaceId');
      console.log(chalk.blueBright(`Fetching pay-schedules for employee with Id: ${employeeId} in workspace ${workspaceId}`));

      const response = await apiClient.get(`/employees/${employeeId}/payroll/payschedule`);

      if (options?.output === 'table') {
        if (!Array.isArray(response.data)) {
          const formattedData = Object.entries(response.data).map(([key, value]) => ({
            Field: key,
            Value: typeof value === 'object' && value !== null ? JSON.stringify(value) : value,
          }));
          console.table(formattedData);
        } else {
          console.table(response.data);
        }
        console.log(chalk.green('✅ Successfully retrieved pay-schedules in table format.'));
        return;
      } else {
        console.log(chalk.blueBright('Outputting pay-schedules in JSON format:\n'));
        console.log(JSON.stringify(response.data, null, 2));
      }

      console.log(chalk.green(`✅ Successfully retrieved pay-schedules for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching pay-schedules for employee ${employeeId}:`, error.message));
      process.exit(1);
    }
  });

  return cmd;
}

export function createTimeOffCommand(): Command {
  const cmd = new Command('time-off <employeeId>')
    .description('Get all time-off balance details for a specific employee')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table');

  cmd.action(async (employeeId: string, options: any) => {
    try {
      const workspaceId = config.get('GsWorkspaceId');
      console.log(chalk.redBright(`Fetching time-off balance details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

      const response = await apiClient.get(`/employees/${employeeId}/payroll/time-off/balances`);
      outputResult(response.data, options?.output || 'table');
      console.log(chalk.green(`✅ Successfully retrieved time-off balance details for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching time-off balance details for employee ${employeeId}:`, error.message));
      process.exit(1);
    }
  });

  return cmd;
}

export function createBenefitsCommand(): Command {
  const cmd = new Command('benefits <employeeId>')
    .description('Get all benefit code details for a specific employee')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table');

  cmd.action(async (employeeId: string, options: any) => {
    try {
      const workspaceId = config.get('GsWorkspaceId');
      console.log(chalk.blueBright(`Fetching benefit code details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

      const response = await apiClient.get(`/employees/${employeeId}/payroll/benefits`);
      outputResult(response.data, options?.output || 'table');
      console.log(chalk.green(`✅ Successfully retrieved benefit code details for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching benefit code details for employee ${employeeId}:`, error.message));
      process.exit(1);
    }
  });

  return cmd;
}

export function createDeductionsCommand(): Command {
  const cmd = new Command('deductions <employeeId>')
    .description('Get all deduction code details for a specific employee')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table');

  cmd.action(async (employeeId: string, options: any) => {
    try {
      const workspaceId = config.get('GsWorkspaceId');
      console.log(chalk.blueBright(`Fetching deduction code details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

      const response = await apiClient.get(`/employees/${employeeId}/payroll/deductions`);
      outputResult(response.data, options?.output || 'table');
      console.log(chalk.green(`✅ Successfully retrieved deduction details for employee ${employeeId}.`));
    } catch (error: any) {
      console.error(chalk.red(`Error fetching deduction code details for employee ${employeeId}:`, error.message));
      process.exit(1);
    }
  });

  return cmd;
}
