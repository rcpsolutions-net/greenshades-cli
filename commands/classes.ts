import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createClassCommands() {
  const classes = new Command('classes')
    .description('View employee classes in the Greenshades API (list, details)');

  classes
    .command('list')  
    .description('Get all employee classes for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all employee classes...'));

        const response = await apiClient.get('/employees/classes');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved employee classes.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching employee classes:', error.message));
        
        process.exit(1);
      }
    });

  classes
    .command('details <class-code>')
    .description('Get a single employee class by their Greenshades classCode')
    .action(async (classCode) => {
      try {
        console.log(chalk.blue(`Fetching employee class with code: ${classCode}...`));

        const response = await apiClient.get(`employees/classes/${classCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved employee class code ${classCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching employee class code ${classCode}:`, error.message));

        process.exit(1);
      }
    });

    // --- CLASS CREATE (POST /employees/classes) ---
  classes.command('create')
    .description('Create a new employee class')
    .option('-f, --file <filePath>', 'Path to JSON file with EmployeeClass object')
    .option('-d, --data <jsonData>', 'Raw JSON string of EmployeeClass object')
    .action(async (options: any) => {
      try {
        let classData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          classData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          classData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue('Creating new employee class...'));
        const response = await apiClient.post('/employees/classes', classData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully created employee class.'));
      } catch (error: any) {
        console.error(chalk.red('Error creating employee class:', error.message));
        process.exit(1);
      }
    });

  // --- CLASS UPDATE (PUT /employees/classes/{code}) ---
  classes.command('update <class-code>')
    .description('Modify an existing employee class')
    .option('-f, --file <filePath>', 'Path to JSON file with EmployeeClass object')
    .option('-d, --data <jsonData>', 'Raw JSON string of EmployeeClass object')
    .action(async (classCode: string, options: any) => {
      try {
        let classData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          classData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          classData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        if (classData.code && classData.code !== classCode) {
          console.error(chalk.red(`Mismatch: CLI arg (${classCode}) does not match body code (${classData.code}).`));
          process.exit(1);
        }
        classData.code = classCode;

        console.log(chalk.blue(`Updating employee class ${classCode}...`));
        await apiClient.put(`/employees/classes/${classCode}`, classData);

        console.log(chalk.green(`✅ Successfully updated employee class ${classCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating employee class ${classCode}:`, error.message));
        process.exit(1);
      }
    });

  // --- CLASS DELETE (DELETE /employees/classes/{code}) ---
  classes.command('delete <class-code>')
    .description('Remove an existing employee class')
    .action(async (classCode) => {
      try {
        console.log(chalk.blue(`Deleting employee class ${classCode}...`));

        await apiClient.delete(`/employees/classes/${classCode}`);
        console.log(chalk.green(`✅ Successfully deleted employee class ${classCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting employee class ${classCode}:`, error.message));
        process.exit(1);
      }
    });

  return classes;
}

export default createClassCommands;