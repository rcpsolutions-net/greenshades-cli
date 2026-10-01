// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createPlacementCommands() {
  const placements = new Command('placements')
    .description('View and manage placements in the Greenshades API (list, details, employee, create, update, delete, bulk)');

   placements.command('list')  
    .description('Get all placements for the current workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all placements...'));

        const response = await apiClient.get('/placements');
        
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green('✅ Successfully retrieved placements.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching placements:', error.message));
        
        process.exit(1);
      }
    });

   placements.command('employee <employeeId>')  
    .description('Get all placements for a specific employee in the current workspace')  
    .action(async (employeeId) => {
      try {        
        console.log(chalk.blue(`--- Fetching all placements for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/placements`);
        
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log(chalk.green('✅ Successfully retrieved placements.'));

      } catch (error: any) {
        console.error(chalk.red(`Error fetching placements for employee ${employeeId}:`, error.message));
        
        process.exit(1);
      }
    });    

   placements.command('details <placement-id>')
    .description('Get specific placement details by their Greenshades placementId')
    .action(async (placementId) => {
      try {
        console.log(chalk.blue(`Fetching placement details with placement Id: ${placementId}...`));

        const response = await apiClient.get(`/placements/${placementId}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved placement ${placementId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching placement ${placementId}:`, error.message));

        process.exit(1);
      }
    });

  // --- CREATE PLACEMENT (POST /placements/{placementId}) ---
  placements.command('create <placement-id>')
    .description('Create a new placement')
    .option('-f, --file <filePath>', 'Path to JSON file with placement data')
    .option('-d, --data <jsonData>', 'Raw JSON string of placement data (placementId, employeeId, startDate, endDate, branch, workLocationCode, positionCode, status)')
    .action(async (placementId: string, options: any) => {
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
          console.error(chalk.yellow('Required fields: placementId, employeeId. Optional: startDate, endDate, branch, workLocationCode, positionCode, status.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Creating placement ${placementId}...`));
        const response = await apiClient.post(`/placements/${placementId}`, bodyData);
        console.log(chalk.green(`✅ Successfully created placement ${placementId}.`));
        console.log(JSON.stringify(response.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red(`Error creating placement ${placementId}:`, error.message));
        process.exit(1);
      }
    });

  // --- UPDATE PLACEMENT (PUT /placements/{placementId}) ---
  placements.command('update <placement-id>')
    .description('Modify an existing placement')
    .option('-f, --file <filePath>', 'Path to JSON file with placement data')
    .option('-d, --data <jsonData>', 'Raw JSON string of placement data (placementId, employeeId, startDate, endDate, branch, workLocationCode, positionCode, status)')
    .action(async (placementId: string, options: any) => {
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
          console.error(chalk.yellow('Required fields: placementId, employeeId. Optional: startDate, endDate, branch, workLocationCode, positionCode, status.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Updating placement ${placementId}...`));
        const response = await apiClient.put(`/placements/${placementId}`, bodyData);
        console.log(chalk.green(`✅ Successfully updated placement ${placementId}.`));
        console.log(JSON.stringify(response.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red(`Error updating placement ${placementId}:`, error.message));
        process.exit(1);
      }
    });

  // --- DELETE PLACEMENT (DELETE /placements/{placementId}) ---
  placements.command('delete <placement-id>')
    .description('Delete a single placement')
    .action(async (placementId: string) => {
      try {
        console.log(chalk.blue(`Deleting placement ${placementId}...`));

        await apiClient.delete(`/placements/${placementId}`);
        console.log(chalk.green(`✅ Successfully deleted placement ${placementId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting placement ${placementId}:`, error.message));
        process.exit(1);
      }
    });

  // --- BULK PLACEMENTS (POST /placements with array body) ---
  placements.command('bulk')
    .description('Update or create a list of employee placements (bulk operation)')
    .option('-f, --file <filePath>', 'Path to JSON file with array of placement objects')
    .option('-d, --data <jsonData>', 'Raw JSON string of array of placement objects')
    .action(async (options: any) => {
      try {
        let bodyData: any[];

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
          console.error(chalk.yellow('Provide an array of placement objects. Each object needs: placementId, employeeId. Optional: startDate, endDate, branch, workLocationCode, positionCode, status.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Processing bulk placements (${bodyData.length} records)...`));
        const response = await apiClient.post('/placements', bodyData);
        console.log(chalk.green(`✅ Successfully processed bulk placements.`));
        console.log(JSON.stringify(response.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error processing bulk placements:', error.message));
        process.exit(1);
      }
    });

  return placements;
}

export default createPlacementCommands;