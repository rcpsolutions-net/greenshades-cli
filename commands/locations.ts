// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createLocationCommands() {
  const locations = new Command('locations')
    .description('View client work locations in the Greenshades API (list, details)');

  locations  
    .command('list')  
    .description('Get all work locations for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.greenBright('--- Fetching all work locations...'));

        const response = await apiClient.get('/worklocations');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved work locations.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching work locations:', error.message));
        
        process.exit(1);
      }
    });

  locations.command('details <location-code>')
    .description('Get a single work location by their Greenshades locationCode')
    .action(async (locationCode) => {
      try {
        console.log(chalk.blueBright(`Fetching work location details with location Code: ${locationCode}...`));

        const response = await apiClient.get(`/worklocations/${locationCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.blue(`✅ Successfully retrieved work location ${locationCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching work location ${locationCode}:`, error.message));

        process.exit(1);
      }
    });

  // --- LOCATION CREATE (POST /worklocations) ---
  locations.command('create')
    .description('Create a new work location')
    .option('-f, --file <filePath>', 'Path to JSON file with WorkLocation object')
    .option('-d, --data <jsonData>', 'Raw JSON string of WorkLocation object')
    .action(async (options: any) => {
      try {
        let locData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          locData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          locData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue('Creating new work location...'));
        const response = await apiClient.post('/worklocations', locData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully created work location.'));
      } catch (error: any) {
        console.error(chalk.red('Error creating work location:', error.message));
        process.exit(1);
      }
    });

  // --- LOCATION UPDATE (PUT /worklocations/{code}) ---
  locations.command('update <location-code>')
    .description('Modify an existing work location')
    .option('-f, --file <filePath>', 'Path to JSON file with WorkLocation object')
    .option('-d, --data <jsonData>', 'Raw JSON string of WorkLocation object')
    .action(async (locCode: string, options: any) => {
      try {
        let locData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          locData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          locData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        if (locData.code && locData.code !== locCode) {
          console.error(chalk.red(`Mismatch: CLI arg (${locCode}) does not match body code (${locData.code}).`));
          process.exit(1);
        }
        locData.code = locCode;

        console.log(chalk.blue(`Updating work location ${locCode}...`));
        await apiClient.put(`/worklocations/${locCode}`, locData);

        console.log(chalk.green(`✅ Successfully updated work location ${locCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating work location ${locCode}:`, error.message));
        process.exit(1);
      }
    });

  // --- LOCATION DELETE (DELETE /worklocations/{code}) ---
  locations.command('delete <location-code>')
    .description('Remove an existing work location')
    .action(async (locCode) => {
      try {
        console.log(chalk.blue(`Deleting work location ${locCode}...`));

        await apiClient.delete(`/worklocations/${locCode}`);
        console.log(chalk.green(`✅ Successfully deleted work location ${locCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting work location ${locCode}:`, error.message));
        process.exit(1);
      }
    });

    return locations;
}

export default createLocationCommands;