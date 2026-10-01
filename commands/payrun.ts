import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createPayrunCommands() {
  const department = new Command('payruns')
    .description('View payruns in the Greenshades API (list, info, employee)');

  department
    .command('list')  
    .description('Get all payruns for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all payruns...'));

        const response = await apiClient.get('/payroll/pay-runs');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved payruns.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching payruns:', error.message));
        
        process.exit(1);
      }
    });

  department
    .command('info <payrun-id>')
    .description('Get earnings for a specific pay run by its Greenshades ID')
    .action(async (payrunId) => {
      try {
        console.log(chalk.blue(`Fetching payrun with ID: ${payrunId}...`));
        
        const response = await apiClient.get(`/payroll/pay-runs/${payrunId}/earnings`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching payrun ${payrunId}:`, error.message));

        process.exit(1);
      }
    });

  // --- PAYRUN DETAILS (GET /payroll/pay-runs/{id}) ---
  department.command('details <payrun-id>')
    .description('Get a single pay run by its Greenshades ID')
    .action(async (payrunId) => {
      try {
        console.log(chalk.blue(`Fetching pay run details with ID: ${payrunId}...`));

        const response = await apiClient.get(`/payroll/pay-runs/${payrunId}`);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully retrieved payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching payrun ${payrunId}:`, error.message));
        process.exit(1);
      }
    });

  // --- CANCEL PAYRUN (DELETE /payroll/pay-runs/{id}) ---
  department.command('cancel <payrun-id>')
    .description('Cancel an existing pay run')
    .action(async (payrunId) => {
      try {
        console.log(chalk.blue(`Cancelling pay run ${payrunId}...`));

        await apiClient.delete(`/payroll/pay-runs/${payrunId}`);
        console.log(chalk.green(`✅ Successfully cancelled payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error cancelling payrun ${payrunId}:`, error.message));
        process.exit(1);
      }
    });

  // --- ADD EMPLOYEE TO PAYRUN (POST /payroll/pay-runs/{id}/employees) ---
  department.command('employee-add <payrun-id> <employee-id>')
    .description('Add an employee to a pay run')
    .option('-f, --file <filePath>', 'Path to JSON file with employee data')
    .option('-d, --data <jsonData>', 'Raw JSON string of employee data')
    .action(async (payrunId, employeeId: string, options: any) => {
      try {
        let bodyData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          bodyData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          bodyData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Adding employee ${employeeId} to payrun ${payrunId}...`));
        await apiClient.post(`/payroll/pay-runs/${payrunId}/employees`, bodyData);
        console.log(chalk.green(`✅ Successfully added employee ${employeeId} to payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error adding employee to payrun ${payrunId}:`, error.message));
        process.exit(1);
      }
    });

  // --- UPDATE EMPLOYEE IN PAYRUN (PUT /payroll/pay-runs/{id}/employees) ---
  department.command('employee-update <payrun-id> <employee-id>')
    .description('Modify information about an employee included in a pay run')
    .option('-f, --file <filePath>', 'Path to JSON file with employee data')
    .option('-d, --data <jsonData>', 'Raw JSON string of employee data')
    .action(async (payrunId, employeeId: string, options: any) => {
      try {
        let bodyData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          bodyData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          bodyData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Updating employee ${employeeId} in payrun ${payrunId}...`));
        await apiClient.put(`/payroll/pay-runs/${payrunId}/employees`, bodyData);
        console.log(chalk.green(`✅ Successfully updated employee ${employeeId} in payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating employee in payrun ${payrunId}:`, error.message));
        process.exit(1);
      }
    });

  // --- REMOVE EMPLOYEE FROM PAYRUN (DELETE /payroll/pay-runs/{id}/employees) ---
  department.command('employee-remove <payrun-id> <employee-id>')
    .description('Remove an employee from a pay run')
    .action(async (payrunId, employeeId: string) => {
      try {
        console.log(chalk.blue(`Removing employee ${employeeId} from payrun ${payrunId}...`));

        await apiClient.delete(`/payroll/pay-runs/${payrunId}/employees`);
        console.log(chalk.green(`✅ Successfully removed employee ${employeeId} from payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error removing employee from payrun ${payrunId}:`, error.message));
        process.exit(1);
      }
    });

  // --- PAYRUN EARNING DETAILS (GET /payroll/pay-runs/{id}/earnings/{earningId}) ---
  department.command('earning <payrun-id> <earning-id>')
    .description('Get a specific pay run earning by its ID')
    .action(async (payrunId, earningId: string) => {
      try {
        console.log(chalk.blue(`Fetching pay run earning ${earningId} from payrun ${payrunId}...`));

        const response = await apiClient.get(`/payroll/pay-runs/${payrunId}/earnings/${earningId}`);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully retrieved payrun earning ${earningId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching payrun earning ${earningId}:`, error.message));
        process.exit(1);
      }
    });

  // --- CREATE PAYRUN EARNINGS (POST /payroll/pay-runs/{id}/earnings) ---
  department.command('earning-add <payrun-id>')
    .description('Create new pay run earnings')
    .option('-f, --file <filePath>', 'Path to JSON file with payrun earnings data')
    .option('-d, --data <jsonData>', 'Raw JSON string of payrun earnings data')
    .action(async (payrunId: string, options: any) => {
      try {
        let bodyData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          bodyData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          bodyData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Creating pay run earnings for payrun ${payrunId}...`));
        await apiClient.post(`/payroll/pay-runs/${payrunId}/earnings`, bodyData);
        console.log(chalk.green(`✅ Successfully created pay run earnings for payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error creating pay run earnings for payrun ${payrunId}:`, error.message));
        process.exit(1);
      }
    });

  // --- UPDATE PAYRUN EARNINGS (PUT /payroll/pay-runs/{id}/earnings) ---
  department.command('earning-update <payrun-id>')
    .description('Update existing pay run earnings')
    .option('-f, --file <filePath>', 'Path to JSON file with payrun earnings data')
    .option('-d, --data <jsonData>', 'Raw JSON string of payrun earnings data')
    .action(async (payrunId: string, options: any) => {
      try {
        let bodyData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          bodyData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          bodyData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Updating pay run earnings for payrun ${payrunId}...`));
        await apiClient.put(`/payroll/pay-runs/${payrunId}/earnings`, bodyData);
        console.log(chalk.green(`✅ Successfully updated pay run earnings for payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating pay run earnings for payrun ${payrunId}:`, error.message));
        process.exit(1);
      }
    });

  // --- DELETE PAYRUN EARNING (DELETE /payroll/pay-runs/{id}/earnings/{earningId}) ---
  department.command('earning-remove <payrun-id> <earning-id>')
    .description('Remove an existing pay run earning')
    .action(async (payrunId: string, earningId: string) => {
      try {
        console.log(chalk.blue(`Removing pay run earning ${earningId} from payrun ${payrunId}...`));

        await apiClient.delete(`/payroll/pay-runs/${payrunId}/earnings/${earningId}`);
        console.log(chalk.green(`✅ Successfully removed payrun earning ${earningId} from payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error removing payrun earning ${earningId}:`, error.message));
        process.exit(1);
      }
    });

  return department;
}

export default createPayrunCommands;