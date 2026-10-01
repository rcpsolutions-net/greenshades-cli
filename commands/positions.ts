// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createPositionCommands() {
  const positions = new Command('positions')
    .description('View positions in the Greenshades API (list, details, worker-compensation-codes)');

  positions.command('list')  
    .description('Get all positions for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all positions...'));

        const response = await apiClient.get('/positions');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved positions.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching positions:', error.message));
        
        process.exit(1);
      }
    });

  positions.command('worker-compensation-codes')  
    .description('Get all worker compensation codes for the current workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all worker compensation codes...'));

        const response = await apiClient.get('/workerscompcodes');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved worker compensation codes.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching worker compensation codes:', error.message));
        
        process.exit(1);
      }
    });    

  positions.command('details <position-code>')
    .description('Get position details by their Greenshades positionCode')
    .action(async (positionCode) => {
      try {
        console.log(chalk.blue(`Fetching position details with position code: ${positionCode}...`));

        const response = await apiClient.get(`/positions/${positionCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved position code ${positionCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching position code ${positionCode}:`, error.message));

        process.exit(1);
      }
    });

  // --- POSITION CREATE (POST /positions) ---
  positions.command('create')
    .description('Create a new position')
    .option('-f, --file <filePath>', 'Path to JSON file with Position object')
    .option('-d, --data <jsonData>', 'Raw JSON string of Position object')
    .action(async (options: any) => {
      try {
        let posData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          posData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          posData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue('Creating new position...'));
        const response = await apiClient.post('/positions', posData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully created position.'));
      } catch (error: any) {
        console.error(chalk.red('Error creating position:', error.message));
        process.exit(1);
      }
    });

  // --- POSITION UPDATE (PUT /positions/{code}) ---
  positions.command('update <position-code>')
    .description('Modify an existing position')
    .option('-f, --file <filePath>', 'Path to JSON file with Position object')
    .option('-d, --data <jsonData>', 'Raw JSON string of Position object')
    .action(async (posCode: string, options: any) => {
      try {
        let posData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          posData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          posData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        if (posData.code && posData.code !== posCode) {
          console.error(chalk.red(`Mismatch: CLI arg (${posCode}) does not match body code (${posData.code}).`));
          process.exit(1);
        }
        posData.code = posCode;

        console.log(chalk.blue(`Updating position ${posCode}...`));
        await apiClient.put(`/positions/${posCode}`, posData);

        console.log(chalk.green(`✅ Successfully updated position ${posCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating position ${posCode}:`, error.message));
        process.exit(1);
      }
    });

  // --- POSITION DELETE (DELETE /positions/{code}) ---
  positions.command('delete <position-code>')
    .description('Remove an existing position')
    .action(async (posCode) => {
      try {
        console.log(chalk.blue(`Deleting position ${posCode}...`));

        await apiClient.delete(`/positions/${posCode}`);
        console.log(chalk.green(`✅ Successfully deleted position ${posCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting position ${posCode}:`, error.message));
        process.exit(1);
      }
    });

    return positions;
}

export default createPositionCommands;