import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createDepartmentCommands() {
  const department = new Command('department')
    .description('View departments in the Greenshades API (list, details)');

  department
    .command('list')  
    .description('Get all departments for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all departments...'));

        const response = await apiClient.get('/departments');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved departments.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching departments:', error.message));
        
        process.exit(1);
      }
    });

  department
    .command('details <department-code>')
    .description('Get a single department by their Greenshades departmentCode')
    .action(async (departmentCode) => {
      try {
        console.log(chalk.blue(`Fetching department with code: ${departmentCode}...`));

        const response = await apiClient.get(`/departments/${departmentCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved department ${departmentCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching department ${departmentCode}:`, error.message));

        process.exit(1);
      }
    });

  // --- DEPARTMENT CREATE (POST /departments) ---
  department.command('create')
    .description('Create a new department')
    .option('-f, --file <filePath>', 'Path to JSON file with Department object')
    .option('-d, --data <jsonData>', 'Raw JSON string of Department object')
    .action(async (options: any) => {
      try {
        let deptData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          deptData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          deptData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue('Creating new department...'));
        const response = await apiClient.post('/departments', deptData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully created department.'));
      } catch (error: any) {
        console.error(chalk.red('Error creating department:', error.message));
        process.exit(1);
      }
    });

  // --- DEPARTMENT UPDATE (PUT /departments/{code}) ---
  department.command('update <department-code>')
    .description('Modify an existing department')
    .option('-f, --file <filePath>', 'Path to JSON file with Department object')
    .option('-d, --data <jsonData>', 'Raw JSON string of Department object')
    .action(async (deptCode: string, options: any) => {
      try {
        let deptData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          deptData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          deptData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        if (deptData.code && deptData.code !== deptCode) {
          console.error(chalk.red(`Mismatch: CLI arg (${deptCode}) does not match body code (${deptData.code}).`));
          process.exit(1);
        }
        deptData.code = deptCode;

        console.log(chalk.blue(`Updating department ${deptCode}...`));
        await apiClient.put(`/departments/${deptCode}`, deptData);

        console.log(chalk.green(`✅ Successfully updated department ${deptCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating department ${deptCode}:`, error.message));
        process.exit(1);
      }
    });

  // --- DEPARTMENT DELETE (DELETE /departments/{code}) ---
  department.command('delete <department-code>')
    .description('Remove an existing department')
    .action(async (deptCode) => {
      try {
        console.log(chalk.blue(`Deleting department ${deptCode}...`));

        await apiClient.delete(`/departments/${deptCode}`);
        console.log(chalk.green(`✅ Successfully deleted department ${deptCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting department ${deptCode}:`, error.message));
        process.exit(1);
      }
    });

    return department;
}

export default createDepartmentCommands;