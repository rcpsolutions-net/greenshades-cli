import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createCustomFieldCommands() {
  const customFields = new Command('custom')
    .description('View custom fields in the Greenshades API (list, details)');

  customFields
    .command('list')  
    .description('Get all custom fields for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all custom fields...'));

        const response = await apiClient.get('/employees/customfields');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved custom fields.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching custom fields:', error.message));
        
        process.exit(1);
      }
    });

  customFields
    .command('details <field-id>')
    .description('Get a single custom field by their Greenshades fieldId')
    .action(async (fieldId) => {
      try {
        console.log(chalk.blue(`Fetching custom field with ID: ${fieldId}...`));

        const response = await apiClient.get(`employees/customfields/${fieldId}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved custom field ID ${fieldId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching custom field ID ${fieldId}:`, error.message));

        process.exit(1);
      }
    });

    customFields
    .command('employee <employee-id>')
    .description('Get all custom fields for a specific employee')
    .action(async (employeeId) => {
        try {
        console.log(chalk.blue(`--- Fetching all custom fields for employee ID ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/customfields`);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully retrieved custom fields for employee ID ${employeeId}.`));

      } catch (error: any) {
        console.error(chalk.red(`Error fetching custom fields for employee ID ${employeeId}:`, error.message));

        process.exit(1);
      }
    });

  // --- CUSTOM FIELD CREATE (POST /employees/customfields) ---
  customFields.command('create')
    .description('Create a new custom field (workspace-level)')
    .option('-f, --file <filePath>', 'Path to JSON file with CustomField object')
    .option('-d, --data <jsonData>', 'Raw JSON string of CustomField object')
    .action(async (options: any) => {
      try {
        let fieldData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          fieldData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          fieldData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          console.error(chalk.yellow('CustomField schema: { name, description?, dataType (Boolean|Date|DateTime|Decimal|Dollar|Enum|Integer|Percentage|Text|TextMultiline), enumValues?, regex? }'));
          process.exit(1);
        }

        console.log(chalk.blue('Creating new custom field...'));
        const response = await apiClient.post('/employees/customfields', fieldData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully created custom field.'));
      } catch (error: any) {
        console.error(chalk.red('Error creating custom field:', error.message));
        process.exit(1);
      }
    });

  // --- CUSTOM FIELD UPDATE (PUT /employees/customfields/{id}) ---
  customFields.command('update <field-id>')
    .description('Modify an existing custom field')
    .option('-f, --file <filePath>', 'Path to JSON file with CustomField object')
    .option('-d, --data <jsonData>', 'Raw JSON string of CustomField object')
    .action(async (fieldId: string, options: any) => {
      try {
        let fieldData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          fieldData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          fieldData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        if (fieldData.id && fieldData.id !== fieldId) {
          console.error(chalk.red(`Mismatch: CLI arg (${fieldId}) does not match body id (${fieldData.id}).`));
          process.exit(1);
        }
        fieldData.id = fieldId;

        console.log(chalk.blue(`Updating custom field ${fieldId}...`));
        await apiClient.put(`/employees/customfields/${fieldId}`, fieldData);

        console.log(chalk.green(`✅ Successfully updated custom field ${fieldId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error updating custom field ${fieldId}:`, error.message));
        process.exit(1);
      }
    });

  // --- CUSTOM FIELD DELETE (DELETE /employees/customfields/{id}) ---
  customFields.command('delete <field-id>')
    .description('Remove an existing custom field')
    .action(async (fieldId) => {
      try {
        console.log(chalk.blue(`Deleting custom field ${fieldId}...`));

        await apiClient.delete(`/employees/customfields/${fieldId}`);
        console.log(chalk.green(`✅ Successfully deleted custom field ${fieldId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting custom field ${fieldId}:`, error.message));
        process.exit(1);
      }
    });

  // --- CUSTOM FIELDS PATCH (PATCH /employees/{id}/customfields) ---
  customFields.command('patch <employee-id>')
    .description("Append or update an employee's custom field values")
    .option('-f, --file <filePath>', 'Path to JSON file with EmployeeCustomFieldValues object (key-value map)')
    .option('-d, --data <jsonData>', 'Raw JSON string of EmployeeCustomFieldValues object')
    .action(async (employeeId: string, options: any) => {
      try {
        let valuesData: any;

        if (options.file) {
          const fs = await import('node:fs');
          if (!fs.existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          valuesData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          valuesData = JSON.parse(options.data);
        } else {
          console.error(chalk.red('You must provide data via --file or --data.'));
          process.exit(1);
        }

        console.log(chalk.blue(`Patching custom field values for employee ${employeeId}...`));
        const response = await apiClient.patch(`/employees/${employeeId}/customfields`, valuesData);

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully patched custom field values for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error patching custom field values for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });

  return customFields;
}

export default createCustomFieldCommands;