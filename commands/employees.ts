// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createEmployeeCommands() {
  const employees = new Command('employee')
    .description('View employees in the Greenshades API (list, pull, dependents, contacts, timeoff, customFields)');

  employees
    .command('list')
    .option('-n, --nativeId [nativeId]', 'filter list by nativeId', false)
    .description('Get all employees for the workspace')
    .action(async (options) => {
      try {        
        console.log(chalk.blue('--- Fetching all employees...'));

        if (options.nativeId) {
          console.log(chalk.yellow(`^ --- Filtering employees by nativeId: ${options.nativeId}`));
        }

        let args = options.nativeId ? { params: { nativeId: options.nativeId } } : undefined;

        const response = await apiClient.get('/employees', args);
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved employees.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching employees:', error.message));
        
        process.exit(1);
      }
    });

  employees
    .command('pull <employee-id>')
    .description('Get a single employee by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });


    employees.command('dependents <employee-id>')
    .description('Get a single employee\'s dependents by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching dependents for employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/dependents`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved dependents for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching dependents for employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });

    employees.command('contacts <employee-id>')
    .description('Get a single employee\'s contacts by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching contacts for employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/contacts`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved contacts for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching contacts for employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });

    employees.command('timeoff <employee-id>')
    .description('Get a single employee\'s time off balances by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching time off balances for employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/time-off/balances`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved time off balances for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching time off balances for employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });

    employees.command('customFields <employee-id>')
    .description('Get a single employee\'s custom fields by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching custom fields for employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/customfields`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved custom fields for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching custom fields for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- UPDATE (PUT /employees/{id}) ---
  employees.command('update <employee-id>')
    .description("Modify an existing employee's profile")
    .option('-f, --file <filePath>', 'Path to JSON file with employee data')
    .option('-d, --data <jsonData>', 'Raw JSON string of employee object')
    .action(async (employeeId: string, options: any) => {
      try {
        let employeeData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          employeeData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          employeeData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide employee data via --file or --data.'));
          process.exit(1);
        }

        // Ensure employeeId matches the path param and body
        if (employeeData.id && employeeData.id !== employeeId) {
          console.error(chalk.red(`Mismatch: CLI arg (${employeeId}) does not match body id (${employeeData.id}).`));
          process.exit(1);
        }
        employeeData.id = employeeId;

        console.log(chalk.blue(`Updating employee with ID: ${employeeId}...`));
        await apiClient.put(`/employees/${employeeId}`, employeeData);

        console.log(chalk.green(`✅ Successfully updated employee ${employeeId}.`));
      } catch (error: any) {
        if (error.response?.data?.errors) {
          console.error(chalk.red('Validation errors:'));
          error.response.data.errors.forEach((e: string) => console.error(`  - ${e}`));
        } else {
          console.error(chalk.red(`Error updating employee ${employeeId}:`, error.message));
        }
        process.exit(1);
      }
    });

  // --- CREATE (POST /employees) ---
  employees.command('create')
    .description('Create a new employee')
    .option('-f, --file <filePath>', 'Path to JSON file with single employee object')
    .option('-d, --data <jsonData>', 'Raw JSON string of employee object')
    .action(async (options: any) => {
      try {
        let employeeData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          employeeData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          employeeData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide employee data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue('Creating new employee...'));
        const response = await apiClient.post('/employees', employeeData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully created employee.'));
      } catch (error: any) {
        if (error.response?.data?.errors) {
          console.error(chalk.red('Validation errors:'));
          error.response.data.errors.forEach((e: string) => console.error(`  - ${e}`));
        } else {
          console.error(chalk.red('Error creating employee:', error.message));
        }
        process.exit(1);
      }
    });

  // --- BULK (POST /employees/bulk) ---
  employees.command('bulk')
    .description('Bulk create or update employees (upsert by nativeId)')
    .option('-f, --file <filePath>', 'Path to JSON file with array of employee objects')
    .option('-d, --data <jsonData>', 'Raw JSON string of employee array')
    .action(async (options: any) => {
      try {
        let employeesData: any[];

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          employeesData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          employeesData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide employee data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Bulk creating/updating ${employeesData.length} employee(s)...`));
        const response = await apiClient.post('/employees/bulk', employeesData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully processed ${employeesData.length} employee(s).`));
      } catch (error: any) {
        if (error.response?.data?.errors) {
          console.error(chalk.red('Validation errors:'));
          error.response.data.errors.forEach((e: string) => console.error(`  - ${e}`));
        } else {
          console.error(chalk.red('Error in bulk operation:', error.message));
        }
        process.exit(1);
      }
    });

  // --- DD GET (GET /employees/{id}/directdeposit) ---
  employees.command('dd <employee-id>')
    .description("Get an employee's direct deposit settings")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching direct deposit settings for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/directdeposit`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved direct deposit for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching direct deposit for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- DD UPDATE (PUT /employees/{id}/directdeposit) ---
  employees.command('dd-update <employee-id>')
    .description("Update an employee's direct deposit settings (overwrites all existing)")
    .option('-f, --file <filePath>', 'Path to JSON file with DirectDepositEntry[] array')
    .option('-d, --data <jsonData>', 'Raw JSON string of DirectDepositEntry[] array')
    .option('-c, --clear', 'Clear all direct deposit accounts (send empty array)')
    .action(async (employeeId: string, options: any) => {
      try {
        let ddData: any[];

        if (options.clear) {
          ddData = [];
        } else if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          ddData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          ddData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file, --data, or use --clear to remove all accounts.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Updating direct deposit for employee ${employeeId} (${ddData.length} entry/entries)...`));
        await apiClient.put(`/employees/${employeeId}/directdeposit`, ddData);

        console.log(chalk.green(`✅ Successfully updated direct deposit for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating direct deposit for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- DD DELETE (DELETE /employees/{id}/directdeposit) ---
  employees.command('dd-delete <employee-id>')
    .description("Delete all of an employee's direct deposit settings")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Deleting direct deposit for employee ${employeeId}...`));

        await apiClient.delete(`/employees/${employeeId}/directdeposit`);
        console.log(chalk.green(`✅ Successfully deleted direct deposit for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting direct deposit for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- EARNINGS (GET /employees/{id}/payroll/earnings) ---
  employees.command('earnings <employee-id>')
    .description("Get an employee's assigned earning codes with rates and maximums")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching earning codes for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/earnings`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved earning codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching earning codes for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- PAYROLL TAX GET (GET /employees/{id}/payroll/taxes/{taxId}) ---
  employees.command('payroll-tax <employee-id> <tax-id>')
    .description("Get an employee's payroll tax setup")
    .action(async (employeeId, taxId) => {
      try {
        console.log(chalk.blue(`Fetching payroll tax setup (tax ${taxId}) for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/taxes/${taxId}`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved payroll tax setup for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching payroll tax setup for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- PAYROLL TAX UPDATE (PUT /employees/{id}/payroll/taxes/{taxId}) ---
  employees.command('payroll-tax-update <employee-id> <tax-id>')
    .description("Save/update an employee's payroll tax setup")
    .option('-f, --file <filePath>', 'Path to JSON file with EmployeePayrollTax object')
    .option('-d, --data <jsonData>', 'Raw JSON string of EmployeePayrollTax object')
    .action(async (employeeId: string, taxId: string, options: any) => {
      try {
        let taxData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          taxData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          taxData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        if (taxData.taxId && taxData.taxId !== taxId) {
          console.error(chalk.red(`Mismatch: CLI arg (${taxId}) does not match body taxId (${taxData.taxId}).`));
          process.exit(1);
        }
        taxData.taxId = taxId;

        console.log(chalk.blue(`Updating payroll tax setup for employee ${employeeId}...`));
        await apiClient.put(`/employees/${employeeId}/payroll/taxes/${taxId}`, taxData);

        console.log(chalk.green(`✅ Successfully saved payroll tax setup for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating payroll tax setup for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- PAY SCHEDULE GET (GET /employees/{id}/payroll/payschedule) ---
  employees.command('pay-schedule <employee-id>')
    .description("Get an employee's assigned payroll pay schedule")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching pay schedule for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/payschedule`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved pay schedule for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching pay schedule for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- PAY SCHEDULE SET (PUT /employees/{id}/payroll/payschedule) ---
  employees.command('pay-schedule-set <employee-id> <pay-schedule-id>')
    .description("Assign a payroll pay schedule to an employee")
    .action(async (employeeId, payScheduleId) => {
      try {
        const body = { payScheduleId };

        console.log(chalk.blue(`Assigning pay schedule ${payScheduleId} to employee ${employeeId}...`));
        await apiClient.put(`/employees/${employeeId}/payroll/payschedule`, body);

        console.log(chalk.green(`✅ Successfully assigned pay schedule ${payScheduleId} to employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error assigning pay schedule for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- PAY SCHEDULE REMOVE (DELETE /employees/{id}/payroll/payschedule) ---
  employees.command('pay-schedule-remove <employee-id>')
    .description("Remove an employee's payroll pay schedule assignment")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Removing pay schedule assignment for employee ${employeeId}...`));

        await apiClient.delete(`/employees/${employeeId}/payroll/payschedule`);
        console.log(chalk.green(`✅ Successfully removed pay schedule for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error removing pay schedule for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- TIME OFF CODE UPSERT (PUT /employees/{id}/payroll/time-off/codes/{codeId}) ---
  employees.command('timeoff-code <employee-id> <code-id>')
    .description("Assign or update an employee's time-off code (upsert with accrual tiers)")
    .option('-f, --file <filePath>', 'Path to JSON file with EmployeeTimeOffCodeAssignment object')
    .option('-d, --data <jsonData>', 'Raw JSON string of EmployeeTimeOffCodeAssignment object')
    .action(async (employeeId: string, codeId: string, options: any) => {
      try {
        let assignmentData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          assignmentData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          assignmentData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Upserting time-off code ${codeId} for employee ${employeeId}...`));
        await apiClient.put(`/employees/${employeeId}/payroll/time-off/codes/${codeId}`, assignmentData);

        console.log(chalk.green(`✅ Successfully upserted time-off code ${codeId} for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error upserting time-off code for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- BENEFITS GET (GET /employees/{id}/payroll/benefits) ---
  employees.command('benefits <employee-id>')
    .description("Get an employee's assigned benefit codes")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching benefit codes for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/benefits`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved benefit codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching benefit codes for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- BENEFITS UPDATE (PUT /employees/{id}/payroll/benefits) ---
  employees.command('benefits-update <employee-id>')
    .description("Assign or update an employee's benefit codes (replaces all existing)")
    .option('-f, --file <filePath>', 'Path to JSON file with EmployeeBenefits[] array')
    .option('-d, --data <jsonData>', 'Raw JSON string of EmployeeBenefits[] array')
    .option('-c, --clear', 'Clear all benefit codes (send empty array)')
    .action(async (employeeId: string, options: any) => {
      try {
        let benefitsData: any[];

        if (options.clear) {
          benefitsData = [];
        } else if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          benefitsData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          benefitsData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file, --data, or use --clear to remove all codes.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Updating benefit codes for employee ${employeeId} (${benefitsData.length} entry/entries)...`));
        await apiClient.put(`/employees/${employeeId}/payroll/benefits`, benefitsData);

        console.log(chalk.green(`✅ Successfully updated benefit codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating benefit codes for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- BENEFITS REMOVE (DELETE /employees/{id}/payroll/benefits) ---
  employees.command('benefits-remove <employee-id>')
    .description("Remove all of an employee's benefit code assignments")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Removing benefit codes for employee ${employeeId}...`));

        await apiClient.delete(`/employees/${employeeId}/payroll/benefits`);
        console.log(chalk.green(`✅ Successfully removed benefit codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error removing benefit codes for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- DEDUCTIONS GET (GET /employees/{id}/payroll/deductions) ---
  employees.command('deductions <employee-id>')
    .description("Get an employee's assigned deduction codes")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching deduction codes for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/deductions`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved deduction codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching deduction codes for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- DEDUCTIONS UPDATE (PUT /employees/{id}/payroll/deductions) ---
  employees.command('deductions-update <employee-id>')
    .description("Assign or update an employee's deduction codes (replaces all existing)")
    .option('-f, --file <filePath>', 'Path to JSON file with EmployeeDeductions[] array')
    .option('-d, --data <jsonData>', 'Raw JSON string of EmployeeDeductions[] array')
    .option('-c, --clear', 'Clear all deduction codes (send empty array)')
    .action(async (employeeId: string, options: any) => {
      try {
        let deductionsData: any[];

        if (options.clear) {
          deductionsData = [];
        } else if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          deductionsData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          deductionsData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file, --data, or use --clear to remove all codes.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Updating deduction codes for employee ${employeeId} (${deductionsData.length} entry/entries)...`));
        await apiClient.put(`/employees/${employeeId}/payroll/deductions`, deductionsData);

        console.log(chalk.green(`✅ Successfully updated deduction codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating deduction codes for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- DEDUCTIONS REMOVE (DELETE /employees/{id}/payroll/deductions) ---
  employees.command('deductions-remove <employee-id>')
    .description("Remove all of an employee's deduction code assignments")
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Removing deduction codes for employee ${employeeId}...`));

        await apiClient.delete(`/employees/${employeeId}/payroll/deductions`);
        console.log(chalk.green(`✅ Successfully removed deduction codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error removing deduction codes for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  // --- SETTLEMENTS (POST /employees/settlements) ---
  employees.command('settlements')
    .description('Create new employee settlements (bulk)')
    .option('-f, --file <filePath>', 'Path to JSON file with settlement array')
    .option('-d, --data <jsonData>', 'Raw JSON string of settlement array')
    .action(async (options: any) => {
      try {
        let settlements: any[];

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          settlements = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          settlements = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide settlements via --file or --data.'));
          process.exit(1);
        }

        if (!Array.isArray(settlements) || settlements.length === 0) {
          console.error(chalk.red('Settlements must be a non-empty JSON array of { employeeId, payPeriod, checkNumber?, payPeriodStart? }.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Creating ${settlements.length} employee settlement(s)...`));
        const response = await apiClient.post('/employees/settlements', settlements);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully created ${settlements.length} employee settlement(s).`));
      } catch (error: any) {
        console.error(chalk.red(`Error creating employee settlements:`, error.message));
        process.exit(1);
      }
    });

  return employees;
}

export default createEmployeeCommands;